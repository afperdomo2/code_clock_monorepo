<script setup lang="ts">
import { IconDeviceFloppy, IconX } from '@tabler/icons-vue';
import Swal from 'sweetalert2';
import { ErrorMessage, Field, Form } from 'vee-validate';
import { ref } from 'vue';
import * as yup from 'yup';
import {
  PROJECT_CATEGORIES,
  PROJECT_CATEGORY_OPTIONS,
  PROJECT_PRIORITIES,
  PROJECT_PRIORITY_OPTIONS,
  PROJECT_STATUSES,
  PROJECT_STATUS_OPTIONS,
} from '../../constants';
import { ProjectCategory, ProjectStatus } from '../../enums';
import api, { getApiErrorMessage } from '../../services/api';
import type { Project } from '../../types/project';

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'create', project: Project): void;
  (e: 'update', project: Project): void;
}>();

const schema = yup.object({
  name: yup.string().required().label('Nombre del Proyecto'),
  category: yup
    .string()
    .required()
    .oneOf(PROJECT_CATEGORIES)
    .label('Categoría'),
  client: yup
    .string()
    .label('Cliente')
    .when('category', {
      is: ProjectCategory.EMPRESA,
      then: (schema) => schema.required(),
      otherwise: (schema) => schema.notRequired(),
    }),
  priority: yup
    .string()
    .required()
    .oneOf(PROJECT_PRIORITIES)
    .label('Prioridad'),
  status: yup.string().required().oneOf(PROJECT_STATUSES).label('Estado'),
  hours_estimated: yup
    .number()
    .nullable()
    .transform((v, o) => (o === '' ? null : v))
    .min(0)
    .label('Horas Estimadas'),
  deadline: yup.string().nullable().label('Fecha de Entrega'),
  description: yup.string().nullable().label('Descripción'),
});

const props = defineProps<{
  isOpen: boolean;
  projectToEdit?: Project;
}>();

const isSubmitting = ref(false);

 
const onSubmit = async (values: any, { resetForm }: any) => {
  isSubmitting.value = true;
  try {
    if (props.projectToEdit) {
      // Update existing project
      const { data } = await api.patch<Project>(
        `/projects/${props.projectToEdit.id}`,
        {
          name: values.name,
          client: values.client,
          category: values.category,
          priority: values.priority,
          hours_estimated: values.hours_estimated,
          deadline: values.deadline,
          status: values.status,
          description: values.description,
        },
      );

      if (data) {
        emit('update', data);

        Swal.fire({
          icon: 'success',
          title: 'Proyecto Actualizado',
          text: 'El proyecto se ha actualizado exitosamente.',
          timer: 1500,
          showConfirmButton: false,
        });

        resetForm();
        emit('close');
      }
    } else {
      // Create new project
      const { data } = await api.post<Project>('/projects', {
        name: values.name,
        client: values.client,
        category: values.category,
        priority: values.priority,
        hours_estimated: values.hours_estimated,
        deadline: values.deadline,
        status: values.status,
        description: values.description,
      });

      if (data) {
        emit('create', data);

        Swal.fire({
          icon: 'success',
          title: 'Proyecto Creado',
          text: 'El proyecto se ha creado exitosamente.',
          timer: 1500,
          showConfirmButton: false,
        });

        resetForm();
        emit('close');
      }
    }
  } catch (error) {
    console.error('Error saving project:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: getApiErrorMessage(error),
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-x-hidden overflow-y-auto transition-opacity bg-black/50 backdrop-blur-sm"
  >
    <div
      class="relative w-full max-w-2xl bg-white shadow-2xl rounded-xl dark:bg-gray-800"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700"
      >
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ projectToEdit ? 'Editar Proyecto' : 'Nuevo Proyecto' }}
        </h3>
        <button
          class="p-2 text-gray-400 rounded-lg cursor-pointer hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
          @click="$emit('close')"
        >
          <IconX class="w-6 h-6" />
        </button>
      </div>

      <!-- Form -->
      <Form
        v-slot="{ values }"
        :validation-schema="schema"
        :initial-values="
          projectToEdit || {
            status: ProjectStatus.ACTIVO,
          }
        "
        class="p-6"
        autocomplete="off"
        @submit="onSubmit"
      >
        <div class="grid gap-6 md:grid-cols-2">
          <!-- Nombre -->
          <div class="col-span-2">
            <label
              for="name"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Nombre del Proyecto <span class="text-red-500">*</span></label>
            <Field
              name="name"
              type="text"
              class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="Ej. Rediseño Web Corporativo"
            />
            <ErrorMessage
              name="name"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            />
          </div>

          <!-- Categoría -->
          <div class="col-span-2 md:col-span-1">
            <label
              for="category"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Categoría <span class="text-red-500">*</span></label>
            <Field
              name="category"
              as="select"
              class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option
                value=""
                disabled
              >
                Seleccionar...
              </option>
              <option
                v-for="category in PROJECT_CATEGORY_OPTIONS"
                :key="category.value"
                :value="category.value"
              >
                {{ category.label }}
              </option>
            </Field>
            <ErrorMessage
              name="category"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            />
          </div>

          <!-- Cliente -->
          <div class="col-span-2 md:col-span-1">
            <label
              for="client"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Cliente
              <span
                v-if="values.category === ProjectCategory.EMPRESA"
                class="text-red-500"
              >*</span></label>
            <Field
              name="client"
              type="text"
              class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="Ej. TechCorp Inc."
            />
            <ErrorMessage
              name="client"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            />
          </div>

          <!-- Prioridad -->
          <div class="col-span-2 md:col-span-1">
            <label
              for="priority"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Prioridad <span class="text-red-500">*</span></label>
            <Field
              name="priority"
              as="select"
              class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option
                value=""
                disabled
              >
                Seleccionar...
              </option>
              <option
                v-for="priority in PROJECT_PRIORITY_OPTIONS"
                :key="priority.value"
                :value="priority.value"
              >
                {{ priority.label }}
              </option>
            </Field>
            <ErrorMessage
              name="priority"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            />
          </div>

          <!-- Horas Estimadas -->
          <div class="col-span-1">
            <label
              for="hours_estimated"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Horas Estimadas</label>
            <Field
              name="hours_estimated"
              type="number"
              class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="Ej. 40"
            />
            <ErrorMessage
              name="hours_estimated"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            />
          </div>

          <!-- Fecha de Entrega -->
          <div class="col-span-2 md:col-span-1">
            <label
              for="deadline"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Fecha de Entrega</label>
            <Field
              name="deadline"
              type="date"
              class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <ErrorMessage
              name="deadline"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            />
          </div>

          <!-- Estado -->
          <div class="col-span-2 md:col-span-1">
            <label
              for="status"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Estado <span class="text-red-500">*</span></label>
            <Field
              name="status"
              as="select"
              class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option
                v-for="status in PROJECT_STATUS_OPTIONS"
                :key="status.value"
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </Field>
            <ErrorMessage
              name="status"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            />
          </div>

          <!-- Descripción -->
          <div class="col-span-2">
            <label
              for="description"
              class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >Descripción</label>
            <Field
              name="description"
              as="textarea"
              rows="2"
              class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              placeholder="Detalles adicionales del proyecto..."
            />
            <ErrorMessage
              name="description"
              class="mt-1 text-sm text-red-600 dark:text-red-400"
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end mt-8 space-x-3">
          <button
            type="button"
            class="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700 cursor-pointer"
            @click="$emit('close')"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="inline-flex items-center rounded-lg bg-indigo-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-indigo-800 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              v-if="isSubmitting"
              class="w-5 h-5 mr-2 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <IconDeviceFloppy
              v-else
              class="w-5 h-5 mr-2"
            />
            {{ isSubmitting ? 'Guardando...' : 'Guardar Proyecto' }}
          </button>
        </div>
      </Form>
    </div>
  </div>
</template>
