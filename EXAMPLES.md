# Real-World Examples

## Example 1: Bilingual Spanish-English User (Spanglish)

### User Setup
```json
{
  "name": "Maria",
  "voiceStory": "I'm trying to build my business while balancing family...",
  "preferences": {
    "language": {
      "primaryLanguage": "es",
      "secondaryLanguages": ["en"],
      "mode": "mixed",
      "mixRatio": 60
    },
    "style": "energetic"
  }
}
```

### Generated Video (Morning)
**Title**: "Tu Día Empieza Ahora"

**Content**:
> "¡Buenos días, Maria! Today is your day para hacer realidad tus sueños. Remember, cada pequeño paso que tomas en tu negocio is building something amazing. Don't let the doubts hold you back - ¡tú tienes la fuerza! Your family is proud of you, y tú eres más capaz than you think. Let's make today count!"

**Voice**: Spanish female (es-MX-DaliaNeural)
**Avatar**: Latina professional avatar
**Music**: Energetic beats

---

## Example 2: Hindi-English User (Hinglish)

### User Setup
```json
{
  "name": "Raj",
  "voiceStory": "मैं एक software developer हूँ, trying to get promoted...",
  "preferences": {
    "language": {
      "primaryLanguage": "hi",
      "secondaryLanguages": ["en"],
      "mode": "mixed",
      "mixRatio": 70
    },
    "style": "professional"
  }
}
```

### Generated Video (Lunch Break)
**Title**: "आधा दिन Complete!"

**Content**:
> "Raj, तुम already halfway through the day हो! Your code आज बहुत अच्छा है। That promotion तुम्हारे पास आने वाला है - you just need to keep showing your skills. Remember, हर bug fix एक step है towards success की। Don't compare yourself दूसरों से - तुम unique हो। Keep coding, keep growing!"

**Voice**: Hindi male (hi-IN-MadhurNeural)
**Avatar**: Indian male professional
**Music**: Corporate uplifting

---

## Example 3: French Only User

### User Setup
```json
{
  "name": "Sophie",
  "voiceStory": "Je veux être plus confiante dans mes choix...",
  "preferences": {
    "language": {
      "primaryLanguage": "fr",
      "secondaryLanguages": [],
      "mode": "single"
    },
    "style": "calm"
  }
}
```

### Generated Video (Evening)
**Title**: "Réflexion du Soir"

**Content**:
> "Bonsoir Sophie. Aujourd'hui, tu as fait des choix courageux. Chaque décision que tu prends renforce ta confiance. N'oublie pas que tu es capable de créer la vie que tu désires. Repose-toi bien ce soir, demain sera une nouvelle opportunité de briller."

**Voice**: French female (fr-FR-DeniseNeural)
**Avatar**: French female professional
**Music**: Ambient peaceful

---

## Example 4: Chinese-English User

### User Setup
```json
{
  "name": "Wei",
  "voiceStory": "我想在美国找到更好的工作...",
  "preferences": {
    "language": {
      "primaryLanguage": "zh",
      "secondaryLanguages": ["en"],
      "mode": "mixed",
      "mixRatio": 50
    },
    "style": "energetic"
  }
}
```

### Generated Video (Morning)
**Title**: "新的一天"

**Content**:
> "Good morning Wei! 今天是a new opportunity。Your skills很valuable，and companies会see that。不要害怕apply for那些dream jobs。每一个interview是practice，每一个rejection让你stronger。Keep improving你的English，keep networking。Success在等着你！"

**Voice**: Chinese female (zh-CN-XiaoxiaoNeural)
**Avatar**: Asian female professional
**Music**: Energetic motivational

---

## Example 5: Portuguese Only (Brazilian)

### User Setup
```json
{
  "name": "Lucas",
  "voiceStory": "Estou começando minha jornada fitness...",
  "preferences": {
    "language": {
      "primaryLanguage": "pt",
      "secondaryLanguages": [],
      "mode": "single"
    },
    "style": "energetic"
  }
}
```

### Generated Video (Morning - Workout)
**Title**: "Hora de Treinar!"

**Content**:
> "Bom dia Lucas! Hoje é dia de treino e você está pronto! Cada repetição te deixa mais forte. Não importa quanto peso você levanta hoje - o importante é aparecer e dar o seu melhor. Seu corpo está agradecendo por cada dia de dedicação. Vamos lá, guerreiro!"

**Voice**: Portuguese male (pt-BR-AntonioNeural)
**Avatar**: Brazilian male athletic
**Music**: Workout beats

---

## API Usage Examples

### 1. Set User to Spanglish Mode

```bash
curl -X PUT http://localhost:3000/api/languages/preferences \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "primaryLanguage": "es",
    "secondaryLanguages": ["en"],
    "mode": "mixed",
    "mixRatio": 70
  }'
```

### 2. Get Available Languages

```bash
curl http://localhost:3000/api/languages/supported \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "languages": [
    {"code": "en", "name": "English", "nativeName": "English"},
    {"code": "es", "name": "Spanish", "nativeName": "Español"},
    {"code": "fr", "name": "French", "nativeName": "Français"},
    {"code": "de", "name": "German", "nativeName": "Deutsch"},
    {"code": "pt", "name": "Portuguese", "nativeName": "Português"},
    {"code": "zh", "name": "Chinese", "nativeName": "中文"},
    {"code": "hi", "name": "Hindi", "nativeName": "हिन्दी"},
    {"code": "ar", "name": "Arabic", "nativeName": "العربية"},
    {"code": "ja", "name": "Japanese", "nativeName": "日本語"},
    {"code": "ko", "name": "Korean", "nativeName": "한국어"}
  ]
}
```

### 3. Generate Multilingual Video

```bash
curl -X POST http://localhost:3000/api/videos/generate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"useAvatar": true}'
```

The system will:
1. Read user's language preferences
2. Generate content in selected language(s)
3. Select appropriate voice
4. Create avatar video with correct accent
5. Add background music
6. Return video URL

### 4. Get Voice Options for Spanish

```bash
curl http://localhost:3000/api/languages/es/voices \
  -H "Authorization: Bearer $TOKEN"
```

Response:
```json
{
  "language": {
    "code": "es",
    "name": "Spanish",
    "nativeName": "Español"
  },
  "voices": {
    "openai": ["nova", "alloy"],
    "did": ["es-ES-ElviraNeural", "es-MX-DaliaNeural", "es-US-AlonsoNeural"],
    "heygen": ["es-ES-ElviraNeural", "es-MX-DaliaNeural"],
    "elevenlabs": ["Bella", "Matilda"]
  }
}
```

---

## Testing Different Language Combinations

### Test 1: Pure English
```bash
curl -X PUT http://localhost:3000/api/languages/preferences \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"primaryLanguage": "en", "mode": "single"}'

curl -X POST http://localhost:3000/api/videos/generate \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"useAvatar": true}'
```

### Test 2: Spanglish (70% Spanish)
```bash
curl -X PUT http://localhost:3000/api/languages/preferences \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "primaryLanguage": "es",
    "secondaryLanguages": ["en"],
    "mode": "mixed",
    "mixRatio": 70
  }'

curl -X POST http://localhost:3000/api/videos/generate \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"useAvatar": true}'
```

### Test 3: Hinglish (60% Hindi)
```bash
curl -X PUT http://localhost:3000/api/languages/preferences \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "primaryLanguage": "hi",
    "secondaryLanguages": ["en"],
    "mode": "mixed",
    "mixRatio": 60
  }'

curl -X POST http://localhost:3000/api/videos/generate \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"useAvatar": true}'
```

---

## Expected Behavior

### Single Language Mode
- ✅ 100% content in selected language
- ✅ Native voice for that language
- ✅ Culturally appropriate messaging
- ✅ No language mixing

### Mixed Language Mode
- ✅ Natural code-switching between languages
- ✅ Respects mixRatio (e.g., 70% primary, 30% secondary)
- ✅ Culturally authentic mixing patterns
- ✅ Smooth transitions between languages
- ✅ Primary language voice with multilingual capability

---

## Common Use Cases

1. **Immigrant Communities**: Mix native language with new country's language
2. **Bilingual Households**: Code-switch like they naturally speak at home
3. **Language Learners**: Gradual introduction of new language while maintaining comfort
4. **Global Professionals**: English + native language for business contexts
5. **Cultural Identity**: Maintain connection to heritage language while using dominant language

---

## Tips for Best Results

1. **Set mixRatio based on daily usage**:
   - 90%: Occasional words in secondary language
   - 70%: Natural bilingual conversation
   - 50%: Equal balance (for balanced bilinguals)

2. **Match user's actual speech patterns**:
   - If they Spanglish daily, enable mixed mode
   - If they speak pure Spanish at home, use single mode

3. **Consider time of day**:
   - Morning: More motivational, energetic
   - Evening: Calmer, reflective
   - All work in any language!

Happy multilingual motivation! 🌍✨
