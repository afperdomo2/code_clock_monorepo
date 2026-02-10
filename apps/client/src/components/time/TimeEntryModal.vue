<script setup lang="ts">
import {
  IconClock,
  IconDeviceFloppy,
  IconManualGearbox,
  IconPlayerPause,
  IconPlayerPlay,
  IconX,
} from '@tabler/icons-vue';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
import { ErrorMessage, Field, Form } from 'vee-validate';
import { onMounted, ref } from 'vue';
import * as yup from 'yup';
import { ACTIVITY_CONFIG } from '../../constants/activity';
import { useTimerStore } from '../../stores/timer';
import api, { getApiErrorMessage } from '../../services/api';
import type { TimeEntryForm } from '../../types/time';
import { ProjectStatus } from '../../enums';

defineProps<{
  isOpen: boolean;
  projectId?: string; // Optional pre-selected project
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', entry: TimeEntryForm & { id: string }): void;
}>();

const timerStore = useTimerStore();
const mode = ref<'timer' | 'manual'>('timer');
const isSubmitting = ref(false);

// Projects for Dropdown
const projects = ref<{ id: string; name: string }[]>([]);

const fetchProjects = async () => {
  try {
    const { data } = await api.get<{ data: { id: string; name: string }[] }>(
      '/projects',
      {
        params: { status: ProjectStatus.ACTIVO, page: 1, limit: 100 },
      },
    );
    projects.value = data.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: getApiErrorMessage(error),
    });
  }
};

onMounted(() => {
  fetchProjects();
});

const toggleTimer = () => {
  if (timerStore.isRunning) {
    timerStore.pauseTimer();
  } else {
    timerStore.startTimer();
  }
};

const stopTimer = () => {
  timerStore.stopTimer();
  // Switch to manual mode with duration pre-filled
  mode.value = 'manual';
};

// Form Schema
const schema = yup.object({
  project_id: yup.string().required().label('Proyecto'),
  activity_type: yup.string().required().label('Tipo de Actividad'),
  description: yup.string().required().label('Descripción'),
  date: yup.string().required().label('Fecha y Hora'),
  duration_hours: yup.number().min(0).label('Horas'),
  duration_minutes: yup.number().min(0).max(59).label('Minutos'),
});

const onSubmit = async (
  values: Record<string, unknown>,
  { resetForm }: { resetForm: () => void },
) => {
  isSubmitting.value = true;
  const hours = Number(values.duration_hours || 0);
  const minutes = Number(values.duration_minutes || 0);
  const durationInMinutes = hours * 60 + minutes;

  if (durationInMinutes <= 0) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'La duración debe ser mayor a 0.',
    });
    isSubmitting.value = false;
    return;
  }

  const durationSeconds = Math.round(durationInMinutes * 60);
  const entryDate = dayjs(values.date as string).toISOString();
  const projectId = String(values.project_id);
  // Calculate end_time by adding duration minutes to the start date
  const endTime = dayjs(values.date as string)
    .add(durationInMinutes, 'minute')
    .toISOString();

  try {
    // 1. Save Time Entry
    const { data } = await api.post<{ id: string } & TimeEntryForm>(
      '/time-entries',
      {
        project_id: projectId,
        description: values.description,
        activity_type: values.activity_type,
        date: entryDate,
        duration: durationSeconds,
        end_time: endTime,
      },
    );

    // 2. Update Project Total Hours
    const { data: projectData } = await api.get<{ hours_spent: number }>(
      `/projects/${projectId}`,
    );
    const newTotal = (projectData.hours_spent || 0) + durationInMinutes / 60;
    await api.patch(`/projects/${projectId}`, { hours_spent: newTotal });

    // 3. Emit Success
    emit('save', {
      ...(values as unknown as TimeEntryForm),
      duration: durationInMinutes, // Emit in minutes as expected by some parents
      id: data.id,
    });

    Swal.fire({
      icon: 'success',
      title: 'Tiempo Registrado',
      text: 'La sesión se ha guardado correctamente.',
      timer: 1500,
      showConfirmButton: false,
    });

    resetForm();
    timerStore.resetTimer();
    emit('close');
  } catch (error) {
    console.error('Error saving time entry:', error);
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
      class="relative w-full max-w-lg bg-white shadow-2xl rounded-xl dark:bg-gray-800"
    >
      <!-- Header -->
      <div
        class="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700"
      >
        <h3 class="text-xl font-bold text-gray-900 dark:text-white">
          Registrar Actividad
        </h3>
        <button
          class="p-2 text-gray-400 rounded-lg cursor-pointer hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700"
          @click="$emit('close')"
        >
          <IconX class="w-6 h-6" />
        </button>
      </div>

      <!-- Mode Switcher -->
      <div class="flex border-b border-gray-100 dark:border-gray-700">
        <button
          :class="[
            'flex-1 py-3 text-sm font-medium transition-colors cursor-pointer',
            mode === 'timer'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400',
          ]"
          @click="mode = 'timer'"
        >
          <div class="flex items-center justify-center">
            <IconClock class="w-5 h-5 mr-2" />
            Timer
          </div>
        </button>
        <button
          :class="[
            'flex-1 py-3 text-sm font-medium transition-colors cursor-pointer',
            mode === 'manual'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400',
          ]"
          @click="mode = 'manual'"
        >
          <div class="flex items-center justify-center">
            <IconManualGearbox class="w-5 h-5 mr-2" />
            Manual
          </div>
        </button>
      </div>

      <div class="p-6">
        <!-- Timer Mode UI -->
        <div
          v-if="mode === 'timer'"
          class="flex flex-col items-center py-8"
        >
          <div
            class="mb-8 font-mono text-6xl font-bold text-gray-900 dark:text-white"
          >
            {{ timerStore.formattedTime }}
          </div>
          <div class="flex space-x-4">
            <button
              :class="[
                'flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-4 cursor-pointer',
                timerStore.isRunning
                  ? 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-300'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-300',
              ]"
              @click="toggleTimer"
            >
              <IconPlayerPause
                v-if="timerStore.isRunning"
                class="w-8 h-8"
              />
              <IconPlayerPlay
                v-else
                class="w-8 h-8 pl-1"
              />
            </button>
            <button
              v-if="timerStore.seconds > 0"
              class="flex items-center justify-center w-16 h-16 text-white transition-transform bg-green-600 rounded-full shadow-lg cursor-pointer hover:scale-105 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300"
              @click="stopTimer"
            >
              <IconDeviceFloppy class="w-8 h-8" />
            </button>
          </div>
          <p class="mt-6 text-sm text-gray-500">
            {{
              timerStore.isRunning
                ? 'Timer en ejecución...'
                : 'Listo para iniciar'
            }}
          </p>
        </div>

        <!-- Manual Mode Form (Also used for saving timer) -->
        <Form
          v-if="mode === 'manual'"
          :validation-schema="schema"
          :initial-values="{
            project_id: projectId || '',
            date: dayjs().format('YYYY-MM-DDTHH:mm'),
            duration_hours:
              mode === 'manual' && timerStore.seconds > 0
                ? Math.floor(timerStore.seconds / 3600)
                : 0,
            duration_minutes:
              mode === 'manual' && timerStore.seconds > 0
                ? Math.ceil((timerStore.seconds % 3600) / 60)
                : 0,
          }"
          @submit="onSubmit"
        >
          <div class="space-y-4">
            <!-- Project Select -->
            <div>
              <label
                class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Proyecto
              </label>
              <Field
                name="project_id"
                as="select"
                class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option
                  value=""
                  disabled
                >
                  Seleccionar Proyecto
                </option>
                <option
                  v-for="p in projects"
                  :key="p.id"
                  :value="p.id"
                >
                  {{ p.name }}
                </option>
              </Field>
              <ErrorMessage
                name="project_id"
                class="mt-1 text-sm text-red-600"
              />
            </div>

            <!-- Activity Type -->
            <div>
              <label
                class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Tipo de Actividad
              </label>
              <Field
                v-slot="{ field, errorMessage }"
                name="activity_type"
              >
                <div class="grid grid-cols-3 gap-3">
                  <button
                    v-for="(config, type) in ACTIVITY_CONFIG"
                    :key="type"
                    type="button"
                    :class="[
                      'flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer',
                      field.value === type
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-500'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600',
                    ]"
                    @click="field.onChange(type)"
                  >
                    <component
                      :is="config.icon"
                      class="w-6 h-6 mb-1"
                      stroke-width="1.5"
                    />
                    <span class="text-xs font-medium">{{ config.label }}</span>
                  </button>
                </div>
                <span
                  v-if="errorMessage"
                  class="mt-1 text-sm text-red-600"
                >{{
                  errorMessage
                }}</span>
              </Field>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <!-- Date -->
              <div>
                <label
                  class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Fecha y Hora
                </label>
                <Field
                  name="date"
                  type="datetime-local"
                  class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
                <ErrorMessage
                  name="date"
                  class="mt-1 text-sm text-red-600"
                />
              </div>

              <!-- Duration -->
              <div>
                <label
                  class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Duración
                </label>
                <div class="flex gap-2">
                  <div class="relative flex-1">
                    <Field
                      name="duration_hours"
                      type="number"
                      min="0"
                      placeholder="0"
                      class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pr-8 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <div
                      class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                    >
                      <span class="text-gray-500 dark:text-gray-400">h.</span>
                    </div>
                    <ErrorMessage
                      name="duration_hours"
                      class="mt-1 text-sm text-red-600"
                    />
                  </div>
                  <div class="relative flex-1">
                    <Field
                      name="duration_minutes"
                      type="number"
                      min="0"
                      max="59"
                      placeholder="0"
                      class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pr-8 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                    <div
                      class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"
                    >
                      <span class="text-gray-500 dark:text-gray-400">min.</span>
                    </div>
                    <ErrorMessage
                      name="duration_minutes"
                      class="mt-1 text-sm text-red-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div>
              <label
                class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Descripción
              </label>
              <Field
                name="description"
                as="textarea"
                rows="3"
                class="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="¿Qué hiciste hoy?"
              />
              <ErrorMessage
                name="description"
                class="mt-1 text-sm text-red-600"
              />
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="isSubmitting"
              class="mt-4 flex w-full items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
              {{ isSubmitting ? 'Guardando...' : 'Guardar Registro' }}
            </button>
          </div>
        </Form>
      </div>
    </div>
  </div>
</template>
