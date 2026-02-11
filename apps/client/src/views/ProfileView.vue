<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useForm } from 'vee-validate';
import * as yup from 'yup';
import Swal from 'sweetalert2';
import { useAuthStore } from '../stores/auth';
import { getApiErrorMessage } from '../services/api';

const authStore = useAuthStore();
const isLoadingProfile = ref(true);
const loadingProfile = ref(false);
const loadingPassword = ref(false);

const profileSchema = yup.object({
  name: yup.string().optional().max(255),
  email: yup.string().required().email(),
});

const passwordSchema = yup.object({
  currentPassword: yup.string().required().min(6),
  newPassword: yup.string().required().min(8),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Las contrasenas no coinciden')
    .required(),
});

const {
  handleSubmit: handleProfileSubmit,
  errors: profileErrors,
  resetForm: resetProfileForm,
  defineField: defineProfileField,
} = useForm({
  validationSchema: profileSchema,
  initialValues: {
    name: authStore.userProfile?.name ?? '',
    email: authStore.userProfile?.email ?? authStore.userEmail ?? '',
  },
});

const {
  handleSubmit: handlePasswordSubmit,
  errors: passwordErrors,
  resetForm: resetPasswordForm,
  defineField: definePasswordField,
} = useForm({
  validationSchema: passwordSchema,
});

const [name] = defineProfileField('name');
const [email] = defineProfileField('email');
const [currentPassword] = definePasswordField('currentPassword');
const [newPassword] = definePasswordField('newPassword');
const [confirmPassword] = definePasswordField('confirmPassword');

const displayEmail = computed(() => authStore.userProfile?.email ?? authStore.userEmail);
const displayName = computed(() => authStore.userProfile?.name ?? '');

const syncProfileForm = () => {
  resetProfileForm({
    values: {
      name: authStore.userProfile?.name ?? '',
      email: authStore.userProfile?.email ?? authStore.userEmail ?? '',
    },
  });
};

onMounted(async () => {
  if (!authStore.userProfile) {
    try {
      await authStore.fetchProfile();
    } finally {
      syncProfileForm();
      isLoadingProfile.value = false;
    }
  } else {
    syncProfileForm();
    isLoadingProfile.value = false;
  }
});

const submitProfile = handleProfileSubmit(async (values) => {
  try {
    loadingProfile.value = true;
    await authStore.updateProfile({
      name: values.name || undefined,
      email: values.email,
    });
    syncProfileForm();
    await Swal.fire({
      icon: 'success',
      title: 'Perfil actualizado',
      text: 'Tus datos fueron guardados correctamente.',
      confirmButtonText: 'Aceptar',
    });
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: getApiErrorMessage(error),
      confirmButtonText: 'Aceptar',
    });
  } finally {
    loadingProfile.value = false;
  }
});

const submitPassword = handlePasswordSubmit(async (values) => {
  try {
    loadingPassword.value = true;
    await authStore.changePassword({
      current_password: values.currentPassword,
      new_password: values.newPassword,
    });
    await Swal.fire({
      icon: 'success',
      title: 'Contrasena actualizada',
      text: 'Tu contrasena fue actualizada correctamente.',
      confirmButtonText: 'Aceptar',
    });
    resetPasswordForm();
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: getApiErrorMessage(error),
      confirmButtonText: 'Aceptar',
    });
  } finally {
    loadingPassword.value = false;
  }
});
</script>

<template>
  <div class="space-y-8">
    <div
      v-if="isLoadingProfile"
      class="flex min-h-[360px] items-center justify-center"
    >
      <div class="flex items-center gap-3 rounded-lg bg-white px-4 py-3 shadow">
        <span
          class="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"
        />
        <span class="text-sm font-medium text-gray-700">Cargando perfil...</span>
      </div>
    </div>

    <div v-else>
      <header class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">
            Perfil
          </h2>
          <p class="text-sm text-gray-500">
            Actualiza tus datos personales y credenciales de acceso.
          </p>
        </div>
      </header>

      <section class="grid gap-6 lg:grid-cols-2">
        <div class="rounded-lg bg-white p-6 shadow">
          <h3 class="text-lg font-semibold text-gray-900">
            Datos del perfil
          </h3>
          <p class="mb-6 text-sm text-gray-500">
            Mantén tu nombre y correo actualizados.
          </p>
          <form
            class="space-y-4"
            @submit="submitProfile"
          >
            <div>
              <label class="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                v-model="name"
                type="text"
                class="mt-1 block w-full rounded-md border px-3 py-2 text-gray-800 shadow-sm focus:outline-none focus:ring-indigo-500"
                :class="{
                  'border-red-500 focus:border-red-500': profileErrors.name,
                  'border-gray-300 focus:border-indigo-500': !profileErrors.name,
                }"
              >
              <span
                v-if="profileErrors.name"
                class="text-sm text-red-500"
              >{{
                profileErrors.name
              }}</span>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Correo electronico</label>
              <input
                v-model="email"
                type="email"
                class="mt-1 block w-full rounded-md border px-3 py-2 text-gray-800 shadow-sm focus:outline-none focus:ring-indigo-500"
                :class="{
                  'border-red-500 focus:border-red-500': profileErrors.email,
                  'border-gray-300 focus:border-indigo-500': !profileErrors.email,
                }"
              >
              <span
                v-if="profileErrors.email"
                class="text-sm text-red-500"
              >{{
                profileErrors.email
              }}</span>
            </div>

            <button
              type="submit"
              :disabled="loadingProfile"
              class="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
            >
              {{ loadingProfile ? 'Guardando...' : 'Guardar cambios' }}
            </button>
          </form>
        </div>

        <div class="rounded-lg bg-white p-6 shadow">
          <h3 class="text-lg font-semibold text-gray-900">
            Cambiar contrasena
          </h3>
          <p class="mb-6 text-sm text-gray-500">
            Usa una contrasena segura para proteger tu cuenta.
          </p>
          <form
            class="space-y-4"
            @submit="submitPassword"
          >
            <div>
              <label class="block text-sm font-medium text-gray-700">Contrasena actual</label>
              <input
                v-model="currentPassword"
                type="password"
                class="mt-1 block w-full rounded-md border px-3 py-2 text-gray-800 shadow-sm focus:outline-none focus:ring-indigo-500"
                :class="{
                  'border-red-500 focus:border-red-500': passwordErrors.currentPassword,
                  'border-gray-300 focus:border-indigo-500': !passwordErrors.currentPassword,
                }"
              >
              <span
                v-if="passwordErrors.currentPassword"
                class="text-sm text-red-500"
              >{{
                passwordErrors.currentPassword
              }}</span>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Nueva contrasena</label>
              <input
                v-model="newPassword"
                type="password"
                class="mt-1 block w-full rounded-md border px-3 py-2 text-gray-800 shadow-sm focus:outline-none focus:ring-indigo-500"
                :class="{
                  'border-red-500 focus:border-red-500': passwordErrors.newPassword,
                  'border-gray-300 focus:border-indigo-500': !passwordErrors.newPassword,
                }"
              >
              <span
                v-if="passwordErrors.newPassword"
                class="text-sm text-red-500"
              >{{
                passwordErrors.newPassword
              }}</span>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Confirmar nueva contrasena</label>
              <input
                v-model="confirmPassword"
                type="password"
                class="mt-1 block w-full rounded-md border px-3 py-2 text-gray-800 shadow-sm focus:outline-none focus:ring-indigo-500"
                :class="{
                  'border-red-500 focus:border-red-500': passwordErrors.confirmPassword,
                  'border-gray-300 focus:border-indigo-500': !passwordErrors.confirmPassword,
                }"
              >
              <span
                v-if="passwordErrors.confirmPassword"
                class="text-sm text-red-500"
              >{{
                passwordErrors.confirmPassword
              }}</span>
            </div>

            <button
              type="submit"
              :disabled="loadingPassword"
              class="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
            >
              {{ loadingPassword ? 'Actualizando...' : 'Actualizar contrasena' }}
            </button>
          </form>
        </div>
      </section>
    </div>
  </div>
</template>
