<script setup lang="ts">
import Swal from 'sweetalert2';
import { useField, useForm } from 'vee-validate';
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import * as yup from 'yup';
import SectionLayout from '../components/layouts/SectionLayout.vue';
import { getApiErrorMessage } from '../services/api';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const loading = ref(false);

const schema = yup.object({
  name: yup.string().optional(),
  email: yup.string().required().email(),
  password: yup.string().required().min(6),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Las contrasenas no coinciden')
    .required(),
});

const { handleSubmit, errors } = useForm({
  validationSchema: schema,
});

const { value: name } = useField<string>('name');
const { value: email } = useField<string>('email');
const { value: password } = useField<string>('password');
const { value: confirmPassword } = useField<string>('confirmPassword');

const handleSetup = handleSubmit(async (values) => {
  try {
    loading.value = true;
    await authStore.registerFirstUser({
      email: values.email,
      password: values.password,
      name: values.name || undefined,
    });
    await Swal.fire({
      icon: 'success',
      title: 'Usuario creado',
      text: 'Ahora puedes iniciar sesion.',
      confirmButtonText: 'Aceptar',
    });
    router.push('/login');
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
  <div class="flex items-center justify-center min-h-screen px-4 bg-gray-100">
    <div class="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
      <SectionLayout>
        <template #title>
          <div>
            <h2 class="text-2xl font-bold text-center text-gray-800">Configuracion inicial</h2>
            <p class="mt-2 text-sm text-center text-gray-600">
              Crea el primer usuario administrador para empezar.
            </p>
          </div>
        </template>

        <template #content>
          <form
            class="space-y-4"
            @submit="handleSetup"
          >
            <div>
              <label class="block text-sm font-medium text-gray-700">Nombre (opcional)</label>
              <input
                v-model="name"
                type="text"
                class="block w-full px-3 py-2 mt-1 text-gray-800 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500"
                :class="{
                  'border-red-500 focus:border-red-500': errors.name,
                  'border-gray-300 focus:border-indigo-500': !errors.name,
                }"
              />
              <span
                v-if="errors.name"
                class="text-sm text-red-500"
                >{{ errors.name }}</span
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Correo electronico</label>
              <input
                v-model="email"
                type="email"
                class="block w-full px-3 py-2 mt-1 text-gray-800 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500"
                :class="{
                  'border-red-500 focus:border-red-500': errors.email,
                  'border-gray-300 focus:border-indigo-500': !errors.email,
                }"
              />
              <span
                v-if="errors.email"
                class="text-sm text-red-500"
                >{{ errors.email }}</span
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Contrasena</label>
              <input
                v-model="password"
                type="password"
                class="block w-full px-3 py-2 mt-1 text-gray-800 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500"
                :class="{
                  'border-red-500 focus:border-red-500': errors.password,
                  'border-gray-300 focus:border-indigo-500': !errors.password,
                }"
              />
              <span
                v-if="errors.password"
                class="text-sm text-red-500"
                >{{ errors.password }}</span
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Confirmar contrasena</label>
              <input
                v-model="confirmPassword"
                type="password"
                class="block w-full px-3 py-2 mt-1 text-gray-800 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500"
                :class="{
                  'border-red-500 focus:border-red-500': errors.confirmPassword,
                  'border-gray-300 focus:border-indigo-500': !errors.confirmPassword,
                }"
              />
              <span
                v-if="errors.confirmPassword"
                class="text-sm text-red-500"
              >
                {{ errors.confirmPassword }}
              </span>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full px-4 py-2 text-white bg-indigo-600 rounded-md cursor-pointer hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {{ loading ? 'Procesando...' : 'Crear usuario' }}
            </button>
          </form>
        </template>
      </SectionLayout>
    </div>
  </div>
</template>
