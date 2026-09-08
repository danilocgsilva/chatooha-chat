<template>
  <div class="min-h-screen transition-colors" :class="isDark ? 'bg-dark-bg' : 'bg-light-bg'">
    <div class="flex flex-col gap-4 p-12 max-w-5xl mx-auto w-full">
      <div class="flex justify-end">
        <button
          @click="toggleTheme"
          class="w-24 shrink-0 py-1.5 rounded-lg text-sm border transition-colors"
          :class="isDark
            ? 'bg-dark-surface text-dark-subtle border-dark-border hover:bg-dark-muted'
            : 'bg-light-surface text-gray-700 border-light-strong hover:bg-light-muted'"
        >{{ isDark ? '☀ Light' : '☾ Dark' }}</button>
      </div>
      <MenuComponent :isDark="isDark" />
      <h1 class="text-3xl font-bold text-center" :class="isDark ? 'text-dark-subtle' : 'text-gray-800'">
        Recent History
      </h1>
      <p class="text-sm text-center" :class="isDark ? 'text-dark-subtle' : 'text-gray-500'">
        Last 40 questions and answers recorded by the proxy.
      </p>

      <div class="flex flex-col gap-6">
        <div
          v-for="(pair, index) in pairs"
          :key="index"
          class="flex flex-col gap-2 rounded-lg border p-4"
          :class="isDark ? 'border-dark-border bg-dark-surface' : 'border-light-strong bg-light-surface'"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wide" :class="isDark ? 'text-dark-subtle' : 'text-gray-400'">
              {{ pair.model }}
            </span>
            <span class="text-xs" :class="isDark ? 'text-dark-subtle' : 'text-gray-400'">
              {{ pair.timestamp }} → {{ pair.completed }}
            </span>
          </div>

          <div class="flex flex-col gap-1">
            <span class="text-xs font-semibold uppercase tracking-wide" :class="isDark ? 'text-dark-subtle' : 'text-gray-400'">Question</span>
            <p class="text-sm rounded-lg px-3 py-2" :class="isDark ? 'bg-dark-bg text-dark-subtle' : 'bg-light-bg text-gray-800'">
              {{ pair.question }}
            </p>
          </div>

          <div class="flex flex-col gap-1">
            <span class="text-xs font-semibold uppercase tracking-wide" :class="isDark ? 'text-dark-subtle' : 'text-gray-400'">Answer</span>
            <p class="text-sm rounded-lg px-3 py-2 whitespace-pre-wrap" :class="isDark ? 'bg-dark-muted text-dark-subtle' : 'bg-light-muted text-gray-700'">
              {{ pair.answer }}
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useGlobalStore } from '../store';
import MenuComponent from '../components/MenuComponent.vue';
import { QAPair } from '../types/QAPair';

const store = useGlobalStore();
const isDark = computed(() => store.isDark);

function toggleTheme(): void {
  store.toggleTheme();
}

const pairs = ref<QAPair[]>([]);

async function fetchPairs(): Promise<void> {
  // TODO: replace with real API call, e.g.:
  // const res = await fetch(`http://${store.serverDns}/alooha_api/recent`);
  // pairs.value = await res.json();
  pairs.value = mockPairs;
}

onMounted(fetchPairs);

const mockPairs: QAPair[] = [
  {
    question: 'What is the difference between supervised and unsupervised learning?',
    answer: 'Supervised learning uses labeled data to train a model to predict outcomes, while unsupervised learning finds hidden patterns in unlabeled data without predefined answers.',
    model: 'llama3.2:latest',
    timestamp: '2025-01-10 08:12:04',
    completed: '2025-01-10 08:12:09',
  },
  {
    question: 'Explain the concept of a closure in JavaScript.',
    answer: 'A closure is a function that retains access to its outer scope even after the outer function has returned. This allows the inner function to "remember" variables from the enclosing context.',
    model: 'llama3.2:latest',
    timestamp: '2025-01-10 09:03:21',
    completed: '2025-01-10 09:03:27',
  },
  {
    question: 'What are the SOLID principles in software engineering?',
    answer: 'SOLID stands for Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion. They are guidelines for writing maintainable and scalable object-oriented code.',
    model: 'mistral:latest',
    timestamp: '2025-01-10 10:45:00',
    completed: '2025-01-10 10:45:08',
  },
  {
    question: 'How does garbage collection work in modern programming languages?',
    answer: 'Garbage collection automatically reclaims memory occupied by objects that are no longer reachable by the program. Common strategies include reference counting and tracing collectors like mark-and-sweep.',
    model: 'mistral:latest',
    timestamp: '2025-01-10 11:20:33',
    completed: '2025-01-10 11:20:41',
  },
  {
    question: 'What is the CAP theorem in distributed systems?',
    answer: 'The CAP theorem states that a distributed system can only guarantee two of three properties simultaneously: Consistency, Availability, and Partition tolerance.',
    model: 'llama3.2:latest',
    timestamp: '2025-01-11 08:55:14',
    completed: '2025-01-11 08:55:20',
  },
  {
    question: 'Can you explain how transformers work in machine learning?',
    answer: 'Transformers use a self-attention mechanism to weigh the relevance of each token in a sequence relative to all others. This allows them to capture long-range dependencies efficiently, making them the foundation of modern LLMs.',
    model: 'deepseek-r1:8b',
    timestamp: '2025-01-11 13:10:05',
    completed: '2025-01-11 13:10:18',
  },
  {
    question: 'What is the difference between a process and a thread?',
    answer: 'A process is an independent program in execution with its own memory space. A thread is a lighter unit of execution within a process that shares the same memory, enabling concurrent operations.',
    model: 'llama3.2:latest',
    timestamp: '2025-01-12 09:30:47',
    completed: '2025-01-12 09:30:53',
  },
  {
    question: 'How does HTTPS ensure secure communication?',
    answer: 'HTTPS uses TLS to encrypt data between client and server. It involves a handshake where certificates are verified and symmetric encryption keys are exchanged, ensuring confidentiality and integrity.',
    model: 'mistral:latest',
    timestamp: '2025-01-12 14:02:19',
    completed: '2025-01-12 14:02:26',
  },
  {
    question: 'What is tail recursion and why does it matter?',
    answer: 'Tail recursion is when a function calls itself as its last operation. Languages that support tail-call optimization can reuse the current stack frame, preventing stack overflow for deep recursive calls.',
    model: 'deepseek-r1:8b',
    timestamp: '2025-01-13 10:18:55',
    completed: '2025-01-13 10:19:03',
  },
  {
    question: 'What are the main differences between REST and GraphQL?',
    answer: 'REST uses fixed endpoints that return predefined data shapes, while GraphQL exposes a single endpoint where clients specify exactly what data they need, reducing over-fetching and under-fetching.',
    model: 'llama3.2:latest',
    timestamp: '2025-01-13 16:44:30',
    completed: '2025-01-13 16:44:38',
  },
];
</script>
