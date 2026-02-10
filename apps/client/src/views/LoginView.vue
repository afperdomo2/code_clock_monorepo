<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useForm, useField } from 'vee-validate';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import { useAuthStore } from '../stores/auth';
import { getApiErrorMessage } from '../services/api';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);

// Validation Schema
const schema = yup.object({
  email: yup.string().required().email(),
  password: yup.string().required().min(6),
});

// Form Setup
const { handleSubmit, errors } = useForm({
  validationSchema: schema,
});

const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');

const handleAuth = handleSubmit(async (values) => {
  try {
    loading.value = true;
    await authStore.login(values.email, values.password);
    router.push('/');
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: getApiErrorMessage(error),
      confirmButtonText: 'Aceptar',
    });
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-100 px-4">
    <div class="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
      <h2 class="mb-6 text-center text-2xl font-bold text-gray-800">
        Bienvenido a Code Clock
      </h2>

      <form
        class="space-y-4"
        @submit="handleAuth"
      >
        <div>
          <label class="block text-sm font-medium text-gray-700">Correo electrónico</label>
          <input
            v-model="email"
            type="email"
            class="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 text-gray-800"
            :class="{
              'border-red-500 focus:border-red-500': errors.email,
              'border-gray-300 focus:border-indigo-500': !errors.email,
            }"
          >
          <span
            v-if="errors.email"
            class="text-sm text-red-500"
          >{{
            errors.email
          }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            v-model="password"
            type="password"
            class="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 text-gray-800"
            :class="{
              'border-red-500 focus:border-red-500': errors.password,
              'border-gray-300 focus:border-indigo-500': !errors.password,
            }"
          >
          <span
            v-if="errors.password"
            class="text-sm text-red-500"
          >{{
            errors.password
          }}</span>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
        >
          {{ loading ? 'Procesando...' : 'Iniciar Sesión' }}
        </button>
      </form>
    </div>
  </div>
</template>
