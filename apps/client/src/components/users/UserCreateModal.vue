<script setup lang="ts">
import { IconDeviceFloppy, IconX } from '@tabler/icons-vue';
import Swal from 'sweetalert2';
import { ErrorMessage, Field, Form } from 'vee-validate';
import { computed, ref } from 'vue';
import * as yup from 'yup';
import api, { getApiErrorMessage } from '../../services/api';
import type { UserProfile } from '../../types';

const props = defineProps<{
  isOpen: boolean;
  userToEdit?: UserProfile | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'created', user: UserProfile): void;
  (e: 'updated', user: UserProfile): void;
}>();

const isSubmitting = ref(false);

const formKey = computed(() => (props.userToEdit ? `edit-${props.userToEdit.id}` : 'create'));
const initialValues = computed(() => ({
  email: props.userToEdit?.email ?? '',
  name: props.userToEdit?.name ?? '',
  password: '',
}));
const schema = computed(() =>
  yup.object({
    email: yup.string().required().email().label('Correo electronico'),
    name: yup.string().max(255).optional().label('Nombre'),
    password: props.userToEdit
      ? yup.string().optional().label('Contrasena')
      : yup.string().required().min(6).label('Contrasena'),
  }),
);

const onSubmit = async (
  values: { email: string; name?: string; password?: string },
  { resetForm }: { resetForm: () => void },
) => {
  try {
    isSubmitting.value = true;
    if (props.userToEdit) {
      const { data } = await api.patch<UserProfile>(`/users/${props.userToEdit.id}`, {
        email: values.email.trim(),
        name: values.name?.trim() || undefined,
      });
      emit('updated', data);
      Swal.fire({
        icon: 'success',
        title: 'Usuario actualizado',
        text: 'El usuario se actualizo correctamente.',
        timer: 1400,
        showConfirmButton: false,
      });
    } else {
      const { data } = await api.post<UserProfile>('/users', {
        email: values.email.trim(),
        password: values.password ?? '',
        name: values.name?.trim() || undefined,
      });
      emit('created', data);
      Swal.fire({
        icon: 'success',
        title: 'Usuario creado',
        text: 'El usuario se creo correctamente.',
        timer: 1400,
        showConfirmButton: false,
      });
    }
    resetForm();
    emit('close');
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: getApiErrorMessage(err),
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
  >
    <div class="w-full max-w-lg rounded-xl bg-white shadow-xl">
      <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h3 class="text-lg font-semibold text-gray-900">
          {{ userToEdit ? 'Editar usuario' : 'Nuevo usuario' }}
        </h3>
        <button
          class="text-gray-400 hover:text-gray-500"
          @click="$emit('close')"
        >
          <IconX class="h-5 w-5" />
        </button>
      </div>
      <Form
        :key="formKey"
        :validation-schema="schema"
        :initial-values="initialValues"
        class="space-y-4"
        @submit="onSubmit"
      >
        <div class="space-y-4 px-6 py-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">
              Correo electronico <span class="text-red-500">*</span>
            </label>
            <Field
              name="email"
              type="email"
              class="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <ErrorMessage
              name="email"
              class="mt-1 text-sm text-red-600"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Nombre</label>
            <Field
              name="name"
              type="text"
              class="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <ErrorMessage
              name="name"
              class="mt-1 text-sm text-red-600"
            />
          </div>
          <div v-if="!userToEdit">
            <label class="block text-sm font-medium text-gray-700">
              Contrasena <span class="text-red-500">*</span>
            </label>
            <Field
              name="password"
              type="password"
              class="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <ErrorMessage
              name="password"
              class="mt-1 text-sm text-red-600"
            />
          </div>
        </div>
        <div class="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            class="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            @click="$emit('close')"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isSubmitting"
          >
            <IconDeviceFloppy class="mr-2 h-4 w-4" />
            {{ isSubmitting ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </Form>
    </div>
  </div>
</template>
