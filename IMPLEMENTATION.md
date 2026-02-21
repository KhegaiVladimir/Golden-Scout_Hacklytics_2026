# Golden Scout — Implementation Documentation

## Обзор изменений

Полностью переписан бэкенд для работы с реальными данными из файлов:
- `database_24_25.csv` — game-by-game статистика (16,513 строк)
- `NBA_Player_Salaries_2024-25_1.csv` — зарплаты игроков

## Структура данных

### database_24_25.csv
**Формат:** Game-by-game данные (одна строка = один игрок в одной игре)

**Колонки:**
```
Player, Tm, Opp, Res, MP, FG, FGA, FG%, 3P, 3PA, 3P%, FT, FTA, FT%, 
ORB, DRB, TRB, AST, STL, BLK, TOV, PF, PTS, GmSc, Data
```

**Особенности:**
- 562 уникальных игрока
- ~16,500 строк данных
- `GmSc` (Game Score) — уже вычислен для каждой игры
- `Data` — дата игры в формате "2024-10-22"
- **Нет колонки Position** — используется хардкодный словарь `POSITION_MAP`

### NBA_Player_Salaries_2024-25_1.csv
**Колонки:**
```
Player, Team, Salary
```

**Формат Salary:** `"$55,761,216 "` (строка с $, запятыми, возможными пробелами)
**Парсинг:** Удаление $, запятых, пробелов → деление на 1,000,000 → `Salary_M` в миллионах

## Модули

### engine/loader.py

**Функциональность:**
1. Загружает `database_24_25.csv` при импорте модуля
2. Агрегирует game-by-game данные в средние значения по игрокам:
   - `GP` = количество игр (count rows)
   - `PTS, AST, TRB, STL, BLK, TOV, FGA, FTA, MP` = средние значения
   - `GmSc_mean` = среднее Game Score
   - `GmSc_std` = стандартное отклонение Game Score
   - `GmSc_last10` = среднее Game Score за последние 10 игр (сортировка по `Data`)
3. Загружает и парсит salary CSV
4. Мержит статистику с зарплатами (left join по `Player`)
5. Назначает позицию из `POSITION_MAP` (по умолчанию "SF")
6. Заполняет NaN нулями
7. Вычисляет `TS_PCT`:
   ```
   TS_PCT = PTS / (2 * (FGA + 0.44 * FTA))
   ```
8. Оценивает `USG_PCT` (proxy):
   ```
   USG_PCT = (FGA + 0.44*FTA + TOV) / (MP * 0.2 + 1)
   ```

**Экспорт:**
- `df_players` — агрегированный DataFrame (один ряд = один игрок)
- `player_list` — отсортированный список имен игроков
- `get_player(name: str) -> dict` — fuzzy match с `score_cutoff=70`, выбрасывает `ValueError` если не найден

### engine/stats.py

**Функции:**

1. **`compute_position_stats(df) -> dict`**
   - Группирует `df_players` по `Pos`
   - Для каждой позиции вычисляет mean + std для: `PTS, AST, TRB, STL, BLK, TOV, TS_PCT, USG_PCT, MP, GP`
   - Возвращает: `{"PG": {"PTS": {"mean": x, "std": y}, ...}, ...}`

2. **`z_score(value, mean, std) -> float`**
   - `(value - mean) / std`
   - Если `std == 0`: возвращает `0.0`
   - Обрезает до `[-3.0, 3.0]`
   - Округляет до 3 знаков

3. **`compute_impact_score(player, pos_stats) -> float`**
   - Получает позицию игрока
   - Вычисляет z-scores относительно позиции для: `PTS, AST, TRB, STL, BLK, TOV, TS_PCT, USG_PCT, MP, GP`
   - Компоненты:
     - `offense = 0.5*z(TS_PCT) + 0.3*z(USG_PCT) + 0.2*z(AST)`
     - `defense = 0.4*z(STL) + 0.4*z(BLK) - 0.2*z(TOV)`
     - `stability = 0.6*z(MP) + 0.4*z(GP)`
     - `age_factor = max(0.0, 1.0 - abs(Age - 27) / 10)` (по умолчанию Age=27 → factor=1.0)
     - `efficiency = z(TS_PCT)`
   - Итоговый impact: `0.35*offense + 0.25*defense + 0.20*stability + 0.10*age_factor + 0.10*efficiency`
   - Округляет до 4 знаков

4. **`compute_percentile(score, all_scores) -> float`**
   - Использует `scipy.stats.percentileofscore` с `kind='rank'`
   - Округляет до 1 знака

5. **`compute_cv(player) -> float`**
   - `CV = (GmSc_std / GmSc_mean) * 100`
   - Если `GmSc_mean == 0`: возвращает `0.0`
   - Округляет до 1 знака
   - Мера консистентности: низкий CV = более надежный игрок

6. **`compute_trend(player) -> str`**
   - `signal = (GmSc_last10 - GmSc_mean) / (GmSc_std + 0.001)`
   - Если `signal > 0.75`: `"TRENDING_UP"`
   - Если `signal < -0.75`: `"TRENDING_DOWN"`
   - Иначе: `"STEADY"`

7. **`build_radar_data(player, pos_stats) -> dict`**
   - Нормализует каждое измерение до 0–100 используя z-scores
   - Возвращает:
     ```python
     {
       "scoring":     clamp(50 + z(PTS)*15, 0, 100),
       "defense":     clamp(50 + ((z(STL)+z(BLK))/2)*15, 0, 100),
       "playmaking":  clamp(50 + z(AST)*15, 0, 100),
       "efficiency":  clamp(50 + z(TS_PCT)*15, 0, 100),
       "consistency": clamp(100 - cv, 0, 100),  # инвертировано
       "durability":  clamp(50 + z(GP)*15, 0, 100)
     }
     ```

8. **`build_full_profile(player_name) -> dict`**
   - Вызывает `get_player(name)` → словарь игрока
   - Загружает `df_players`, вычисляет `pos_stats`
   - Вычисляет все impact scores для percentile
   - Возвращает полный профиль со всеми метриками

### engine/simulation.py

**`simulate_season(impact_score, current_team_wins=38, n=10000) -> dict`**

Логистическая модель на основе impact score:
```python
baseline = current_team_wins / 82
win_prob = 1 / (1 + exp(-(baseline + impact_score * 0.03)))
simulations = binomial(82, win_prob, n)
```

**Возвращает:**
- `expected_wins` — среднее количество побед
- `wins_added` — добавленные победы (expected - current)
- `win_range_low` — 5-й перцентиль
- `win_range_high` — 95-й перцентиль
- `playoff_prob` — вероятность попадания в плей-офф (>= 41 победа)
- `win_distribution` — список из n симуляций (int, не numpy.int64)

### engine/valuation.py

**`calculate_value(wins_added, requested_salary_m, value_per_win=3.8) -> dict`**

Использует модель Berri & Schmidt (2010): **$3.8M за победу**

**Логика:**
- `fair_value = wins_added * 3.8`
- `efficiency_ratio = fair_value / requested_salary_m`
- `overpay_pct = (requested - fair) / fair * 100`

**Решение:**
- `efficiency >= 1.0` → `"SIGN"`
- `efficiency >= 0.7` → `"NEGOTIATE"`
- Иначе → `"AVOID"`

### ai/gemini.py

**`generate_report(computed_results: dict) -> dict`**

**Системный промпт:**
```
You are a GM-level executive analyst writing a contract brief.
All statistics have been pre-computed by our engine. Do not recalculate anything.
Interpret the numbers and write a structured report.

Format — use these EXACT labels on separate lines, nothing else:
VERDICT: [1 sentence, direct assessment of this player]
STRENGTHS: [exactly 2 points separated by | citing specific numbers]
CONCERN: [exactly 1 point, honest risk]
RECOMMENDATION: [SIGN or NEGOTIATE or AVOID] — [1 sentence justification mentioning efficiency ratio]
AUDIO_SUMMARY: [2 sentences max, executive tone, for voice playback]

Under 150 words total. No markdown. No asterisks. No bullet characters.
```

**Функциональность:**
1. Проверяет кэш → возвращает если есть
2. Вызывает Gemini API с системным промптом + `json.dumps(computed_results)`
3. Парсит ответ: разбивает по меткам ("VERDICT:", "STRENGTHS:", и т.д.)
4. Возвращает словарь: `{verdict, strengths, concern, recommendation, audio_summary}`
5. При ошибке: возвращает `{"verdict": raw_text, ...}`
6. Сохраняет в кэш перед возвратом

**Кэш:** `report_cache = {}` — ключ: `json.dumps(computed_results, sort_keys=True)`

### ai/elevenlabs.py

**`generate_audio(text: str, player_name: str) -> bytes`**

**Функциональность:**
1. Санитизирует `player_name` для имени файла (заменяет пробелы на `_`)
2. Проверяет `audio_cache/{safe_name}.mp3` → читает и возвращает bytes если существует
3. POST запрос к `https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}`
   - Headers: `{"xi-api-key": KEY, "Content-Type": "application/json"}`
   - Body: `{"text": text, "model_id": "eleven_monolingual_v1", "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}}`
4. Сохраняет response bytes в `audio_cache/{safe_name}.mp3`
5. Возвращает bytes
6. При ошибке: выбрасывает `HTTPException(503)`

**Кэш:** 
- Файловый: `audio_cache/{player_name}.mp3`
- В памяти: `audio_file_cache = {}` (player_name → file path)

## API Endpoints

### GET `/`
Health check
```json
{"status": "ok", "players_loaded": 562}
```

### GET `/players`
Список всех игроков
```json
["Aaron Gordon", "Al Horford", ...]
```

### GET `/player/{name}/profile`
Полный профиль игрока
```json
{
  "player": "LeBron James",
  "team": "LAL",
  "position": "SF",
  "impact_score": 1.2345,
  "percentile": 95.2,
  "z_scores": {...},
  "stats": {...},
  "radar": {...}
}
```

### POST `/simulate`
Монте-Карло симуляция
```json
{
  "impact_score": 1.2,
  "current_team_wins": 38
}
```
**Ответ:**
```json
{
  "expected_wins": 45.3,
  "wins_added": 7.3,
  "win_range_low": 38,
  "win_range_high": 52,
  "playoff_prob": 65.2,
  "win_distribution": [42, 43, 44, ...]
}
```

### POST `/value`
Оценка контракта
```json
{
  "wins_added": 7.3,
  "requested_salary_m": 25.0,
  "value_per_win": 3.8
}
```
**Ответ:**
```json
{
  "fair_value_m": 27.7,
  "efficiency_ratio": 1.11,
  "overpay_pct": -9.7,
  "decision": "SIGN"
}
```

### POST `/report`
Генерация AI отчета
```json
{
  "computed_results": {
    "player": "LeBron James",
    "impact_score": 1.2,
    "efficiency_ratio": 1.11,
    ...
  }
}
```
**Ответ:**
```json
{
  "verdict": "...",
  "strengths": "...",
  "concern": "...",
  "recommendation": "SIGN — ...",
  "audio_summary": "..."
}
```

### POST `/audio`
Генерация аудио
```json
{
  "text": "LeBron James is a high-impact player...",
  "player_name": "LeBron James"
}
```
**Ответ:** MP3 файл (bytes)

### GET `/compare`
Сравнение двух игроков
```
/compare?player1=LeBron James&player2=Stephen Curry&current_team_wins=38&requested_salary_m=20.0
```
**Ответ:**
```json
{
  "player1_profile": {...},
  "player2_profile": {...},
  "player1_simulation": {...},
  "player2_simulation": {...},
  "player1_valuation": {...},
  "player2_valuation": {...},
  "head_to_head_report": {...}
}
```

## Обработка ошибок

- `ValueError` из `get_player()` → `HTTPException(404, detail="Player not found")`
- Исключения в `/report` или `/audio` → `HTTPException(503, detail=str(e))`
- Все маршруты обернуты в `try/except`

## CORS

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Запуск

```bash
cd backend
uvicorn main:app --reload --port 8000
```

## Зависимости

- `fastapi>=0.110.0`
- `uvicorn>=0.28.0`
- `pandas>=2.2.0`
- `numpy>=1.26.4`
- `scipy>=1.12.0`
- `google-generativeai>=0.4.0`
- `python-dotenv>=1.0.0`
- `fuzzywuzzy>=0.18.0`
- `python-Levenshtein>=0.23.0`
- `httpx>=0.26.0`
- `pydantic>=2.6.0`

## Переменные окружения (.env)

```
GEMINI_API_KEY=your_gemini_key_from_aistudio_google_com
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID=your_chosen_voice_id
```

## Ключевые особенности реализации

1. **Агрегация данных:** Game-by-game данные агрегируются в средние значения по игрокам при загрузке модуля
2. **Position-based z-scores:** Все z-scores вычисляются относительно позиции игрока
3. **Кэширование:** 
   - Gemini отчеты кэшируются в памяти
   - ElevenLabs аудио кэшируется на диске
4. **Fuzzy matching:** Поиск игроков с порогом 70% схожести
5. **JSON serialization:** Все numpy типы конвертируются в Python native типы
6. **Округление:** Все float значения округляются до разумной точности

## Изменения по сравнению с предыдущей версией

1. ✅ Переписана загрузка данных для работы с game-by-game форматом
2. ✅ Добавлена агрегация статистики по игрокам
3. ✅ Реализованы position-based z-scores
4. ✅ Добавлен расчет TS% и USG% proxy
5. ✅ Переписана симуляция на основе impact score
6. ✅ Переписана оценка контракта на основе wins added
7. ✅ Обновлен формат Gemini отчета
8. ✅ Переписан ElevenLabs модуль на httpx
9. ✅ Добавлен endpoint `/compare` для сравнения игроков
10. ✅ Все функции полностью реализованы без placeholder'ов
