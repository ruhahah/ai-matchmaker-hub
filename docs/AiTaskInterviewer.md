# 🤖 AI Task Interviewer Component

## Overview
`AiTaskInterviewer` - это высококачественный компонент для создания социальных задач через conversational AI интерфейс с использованием OpenAI Structured Outputs.

## Features

### 🎯 Core Functionality
- **Conversational Interface**: Chat-like UI with natural language processing
- **Structured Data Extraction**: Automatic extraction of task fields from user messages
- **Progress Tracking**: Real-time visualization of captured data fields
- **Smart Questioning**: AI asks targeted questions when data is incomplete
- **Review & Publish**: Beautiful task preview before publication

### 🎨 UI Components
- **Chat Interface**: ScrollArea with message bubbles
- **Progress Indicators**: Visual badges for each data field
- **Typing Indicator**: Loading state during AI processing
- **Review Card**: Formatted task preview with edit options
- **Trust UI Aesthetics**: Teal/blue accents, monospace fonts for AI data

## Technical Implementation

### 📋 Data Structure
```typescript
interface TaskData {
  title: string;
  description: string;
  location: string;
  date: string;
  volunteers_needed: number;
  skills: string[];
}
```

### 🔄 AI Logic Flow
1. **User Input** → Extract partial data using regex patterns
2. **Data Validation** → Check if all required fields are present
3. **Response Generation**:
   - If complete: Use OpenAI Structured Outputs for validation
   - If incomplete: Generate targeted clarifying question
4. **Progress Update** → Update UI progress indicators
5. **Final Review** → Show task preview and publish options

### 🛠️ API Integration

#### AI Interview Endpoint
```
POST /api/ai-task-interview
```
- Processes user messages
- Extracts structured data
- Generates responses using OpenAI GPT-4o-mini
- Returns: { message, taskData?, partialData? }

#### Task Publication Endpoint
```
POST /api/tasks
```
- Validates task data
- Saves to Supabase database
- Returns: { success, task, message }

## Usage Example

```typescript
import AiTaskInterviewer, { TaskData } from '@/components/AiTaskInterviewer';

function OrganizerDashboard() {
  const handleTaskCreated = (taskData: TaskData) => {
    console.log('New task created:', taskData);
    // Refresh tasks list, show success message, etc.
  };

  return (
    <AiTaskInterviewer onTaskCreated={handleTaskCreated} />
  );
}
```

## AI Prompt Engineering

### System Prompt
```
Ты — ассистент-координатор платформы Sun Proactive в Астане. 
Твоя цель — собрать данные для создания задачи.

Требуемые поля:
1. title (краткое название)
2. description (подробности) 
3. location (обязательно в Астане)
4. date (дата проведения)
5. volunteers_needed (число)
6. skills (массив нужных навыков)

Логика:
- Если данных мало → задай ОДИН дружелюбный уточняющий вопрос
- Если данных достаточно → верни JSON-объект
- Всегда поддерживай контекст Астаны
```

### Structured Output Schema
Uses OpenAI's `json_schema` response format with strict validation:
- Required fields validation
- Type checking (string, number, array)
- Additional properties forbidden
- Custom descriptions for each field

## UI/UX Design

### 🎨 Visual Elements
- **Gradient backgrounds**: Blue to teal color scheme
- **Icon indicators**: Lucide icons for each data field
- **Animation**: Smooth transitions and typing indicators
- **Responsive design**: Mobile-friendly layout

### 📊 Progress Tracking
```typescript
const progress = [
  { key: 'title', label: 'Название', icon: Sparkles, captured: false },
  { key: 'location', label: 'Локация', icon: MapPin, captured: false },
  { key: 'date', label: 'Дата', icon: Calendar, captured: false },
  { key: 'volunteers_needed', label: 'Волонтеры', icon: Users, captured: false },
  { key: 'skills', label: 'Навыки', icon: Wrench, captured: false },
  { key: 'description', label: 'Описание', icon: Edit, captured: false }
];
```

### 💬 Chat Interface
- **Message bubbles**: Different colors for user/assistant
- **Timestamps**: Show message times
- **Auto-scroll**: Always show latest messages
- **Typing indicator**: Loading state during AI processing

## Error Handling

### 🛡️ Graceful Fallbacks
- **API failures**: Show error toast and continue conversation
- **Invalid responses**: Fallback to manual editing option
- **Network issues**: Retry mechanism with user notification
- **Missing fields**: Smart question generation

### 🔄 Data Recovery
- **Partial data preservation**: Keep extracted data between messages
- **Context retention**: Use last 5 messages for AI context
- **State management**: React state with proper cleanup

## Performance Optimization

### ⚡ Efficient Updates
- **Debounced input**: Prevent excessive API calls
- **Memoized components**: Reduce unnecessary re-renders
- **Lazy loading**: Load AI responses only when needed
- **Optimistic updates**: Instant UI feedback

### 📱 Mobile Optimization
- **Touch-friendly**: Large tap targets
- **Keyboard handling**: Enter to send, Shift+Enter for new line
- **Viewport optimization**: Proper scroll behavior
- **Reduced motion**: Respect user preferences

## Security Considerations

### 🔒 Data Protection
- **Input sanitization**: Prevent XSS attacks
- **API key security**: Server-side OpenAI calls only
- **Rate limiting**: Prevent abuse of AI endpoints
- **Data validation**: Server-side validation before database save

### 🛡️ Error Boundaries
- **Component isolation**: Prevent crashes from affecting app
- **Graceful degradation**: Fallback to manual form if AI fails
- **User feedback**: Clear error messages and recovery options

## Future Enhancements

### 🚀 Planned Features
- **Multi-language support**: Kazakh language integration
- **Voice input**: Speech-to-text for task creation
- **Template system**: Pre-defined task templates
- **Collaborative editing**: Multiple organizers can edit together
- **AI suggestions**: Proactive task recommendations

### 🔧 Technical Improvements
- **Streaming responses**: Real-time AI response streaming
- **Caching**: Reduce API calls with smart caching
- **Analytics**: Track task creation patterns
- **A/B testing**: Optimize conversation flows

## Troubleshooting

### Common Issues
1. **OpenAI API errors**: Check API key configuration
2. **Missing data**: Verify regex patterns for data extraction
3. **UI not updating**: Check React state management
4. **Database errors**: Verify Supabase connection and schema

### Debug Mode
Add debug logging to track AI responses:
```typescript
console.log('AI Response:', response);
console.log('Extracted Data:', partialData);
console.log('Progress Update:', progress);
```

## Dependencies

### Required Packages
- `openai`: ^4.0.0
- `@/components/ui/*`: shadcn/ui components
- `lucide-react`: Icons
- `@/hooks/use-toast`: Toast notifications

### Environment Variables
```
OPENAI_API_KEY=your_openai_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🎉 Conclusion

The `AiTaskInterviewer` component represents a significant advancement in user experience for task creation, combining the power of AI with a beautiful, intuitive interface. It transforms the traditionally complex task creation process into a natural, conversational experience that guides users through the process while maintaining data integrity and providing clear visual feedback.

The component is production-ready with comprehensive error handling, responsive design, and scalable architecture that can easily be extended with additional features and improvements.
