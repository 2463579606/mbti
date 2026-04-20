import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useTestStore = defineStore('test', () => {
  // State
  const sessionToken = ref<string | null>(null);
  const currentQuestion = ref<number>(0);
  const answers = ref<Map<number, number>>(new Map());
  const isComplete = ref<boolean>(false);
  const result = ref<any>(null);

  // Computed
  const answeredCount = computed(() => answers.value.size);
  const progress = computed(() => Math.round((answeredCount.value / 60) * 100));

  // Actions
  function setSessionToken(token: string) {
    sessionToken.value = token;
    localStorage.setItem('mbti_session_token', token);
    saveToLocalStorage();
  }

  function setAnswer(questionId: number, option: number) {
    answers.value.set(questionId, option);
    saveToLocalStorage();
  }

  function getAnswer(questionId: number): number | undefined {
    return answers.value.get(questionId);
  }

  function setCurrentQuestion(questionNumber: number) {
    currentQuestion.value = questionNumber;
  }

  function nextQuestion() {
    if (currentQuestion.value < 59) {
      currentQuestion.value++;
    }
  }

  function previousQuestion() {
    if (currentQuestion.value > 0) {
      currentQuestion.value--;
    }
  }

  function reset() {
    sessionToken.value = null;
    currentQuestion.value = 0;
    answers.value.clear();
    isComplete.value = false;
    result.value = null;
    localStorage.removeItem('mbti_test_session');
    localStorage.removeItem('mbti_session_token');
  }

  function saveToLocalStorage() {
    const data = {
      sessionToken: sessionToken.value,
      currentQuestion: currentQuestion.value,
      answers: Array.from(answers.value.entries()),
    };
    localStorage.setItem('mbti_test_session', JSON.stringify(data));
  }

  function loadFromLocalStorage() {
    // First try to get session token from the dedicated location
    const dedicatedToken = localStorage.getItem('mbti_session_token');
    if (dedicatedToken) {
      sessionToken.value = dedicatedToken;
    }

    // Then load the rest from the combined session data
    const saved = localStorage.getItem('mbti_test_session');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (!dedicatedToken) {
          sessionToken.value = data.sessionToken;
        }
        currentQuestion.value = data.currentQuestion || 0;
        answers.value = new Map(data.answers || []);

        // Validate loaded data - if currentQuestion is 59 (last question),
        // it's likely an old completed test, so clear it
        if (currentQuestion.value >= 59 || answers.value.size >= 60) {
          console.log('Detected old completed test data, clearing cache');
          reset();
          return;
        }
      } catch (error) {
        console.error('Failed to load session from localStorage:', error);
      }
    }
  }

  function setResult(testResult: any) {
    result.value = testResult;
    isComplete.value = true;
  }

  // Initialize from localStorage
  loadFromLocalStorage();

  return {
    // State
    sessionToken,
    currentQuestion,
    answers,
    isComplete,
    result,
    // Computed
    answeredCount,
    progress,
    // Actions
    setSessionToken,
    setAnswer,
    getAnswer,
    setCurrentQuestion,
    nextQuestion,
    previousQuestion,
    reset,
    setResult,
    saveToLocalStorage,
    loadFromLocalStorage,
  };
});
