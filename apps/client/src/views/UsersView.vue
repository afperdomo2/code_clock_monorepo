<script setup lang="ts">
import {
  IconLock,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconTrash,
} from '@tabler/icons-vue';
import Swal from 'sweetalert2';
import { computed, ref } from 'vue';
import UserCreateModal from '../components/users/UserCreateModal.vue';
import { useAlertOnError } from '../composables/useAlertOnError';
import { useDeleteUserMutation, useUsersQuery } from '../composables/useUsers';
import { getApiErrorMessage } from '../services/api';
import type { UserProfile } from '../types';

const search = ref('');
const isModalOpen = ref(false);
const editingUser = ref<UserProfile | null>(null);

const { data, isLoading, isFetching, error, refetch } = useUsersQuery(search);
useAlertOnError(error, 'No se pudieron cargar los usuarios');

const deleteMutation = useDeleteUserMutation();

const users = computed(() => data.value?.data ?? []);

const openCreate = () => {
  editingUser.value = null;
  isModalOpen.value = true;
};

const openEdit = (user: UserProfile) => {
  if (user.is_admin) {
    Swal.fire({
      icon: 'info',
      title: 'Accion no permitida',
      text: 'Los usuarios administradores no pueden ser modificados.',
    });
    return;
  }
  editingUser.value = user;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const confirmDelete = async (user: UserProfile) => {
  if (user.is_admin) {
    Swal.fire({
      icon: 'info',
      title: 'Accion no permitida',
      text: 'Los usuarios administradores no pueden ser eliminados.',
    });
    return;
  }

  const result = await Swal.fire({
    icon: 'warning',
    title: 'Eliminar usuario',
    text: `Se eliminara el usuario ${user.email}. Esta accion no se puede deshacer.`,
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
  });

  if (!result.isConfirmed) {
    return;
  }

  try {
    await deleteMutation.mutateAsync(user.id);
    Swal.fire({
      icon: 'success',
      title: 'Usuario eliminado',
      timer: 1200,
      showConfirmButton: false,
    });
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: getApiErrorMessage(err),
    });
  }
};
</script>

<template>
  <div class="space-y-6">
    <header class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Usuarios</h2>
        <p class="text-gray-600">Administra usuarios del sistema.</p>
      </div>
      <div class="flex gap-3">
        <button
          class="flex items-center justify-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
          :disabled="isFetching"
          @click="
            () => {
              void refetch();
            }
          "
        >
          <IconRefresh
            class="w-5 h-5 mr-2"
            :class="{ 'animate-spin': isFetching }"
          />
          Refrescar
        </button>
        <button
          class="flex items-center justify-center px-4 py-2 text-white bg-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-700"
          @click="openCreate"
        >
          <IconPlus class="w-5 h-5 mr-2" />
          Nuevo usuario
        </button>
      </div>
    </header>

    <div class="flex flex-col gap-4 p-4 bg-white rounded-lg shadow sm:flex-row sm:items-center">
      <div class="relative flex-1">
        <IconSearch class="absolute w-5 h-5 text-gray-400 -translate-y-1/2 left-3 top-1/2" />
        <input
          v-model="search"
          type="text"
          placeholder="Buscar usuario..."
          class="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>
    </div>

    <div
      v-if="isLoading"
      class="flex justify-center py-12"
    >
      <div
        class="w-8 h-8 border-4 border-indigo-600 rounded-full animate-spin border-t-transparent"
      />
    </div>

    <div
      v-else
      class="overflow-hidden bg-white rounded-lg shadow"
    >
      <table class="w-full text-sm text-left">
        <thead class="text-xs text-gray-500 uppercase bg-gray-50">
          <tr>
            <th class="px-4 py-3">Usuario</th>
            <th class="px-4 py-3 text-center">Rol</th>
            <th class="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="user in users"
            :key="user.id"
          >
            <td class="px-4 py-3">
              <p class="font-medium text-gray-900">
                {{ user.email }}
              </p>
              <p
                v-if="user.name"
                class="text-xs text-gray-500"
              >
                {{ user.name }}
              </p>
            </td>
            <td class="px-4 py-3 text-center">
              <span
                class="px-3 py-1 text-xs font-medium rounded-full"
                :class="
                  user.is_admin ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                "
              >
                {{ user.is_admin ? 'Administrador' : 'Usuario' }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <div
                v-if="user.is_admin"
                class="flex justify-center"
              >
                <IconLock
                  class="w-5 h-5 text-gray-400"
                  title="Los usuarios administradores no pueden ser modificados."
                />
              </div>
              <div
                v-else
                class="flex justify-center gap-2"
              >
                <button
                  class="flex items-center rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 cursor-pointer"
                  @click="openEdit(user)"
                >
                  <IconPencil class="w-4 h-4 mr-1" />
                  Editar
                </button>
                <button
                  class="flex items-center rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 cursor-pointer"
                  @click="confirmDelete(user)"
                >
                  <IconTrash class="w-4 h-4 mr-1" />
                  Eliminar
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td
              class="px-4 py-6 text-center text-gray-500"
              colspan="3"
            >
              No hay usuarios para mostrar.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <UserCreateModal
      :is-open="isModalOpen"
      :user-to-edit="editingUser"
      @close="closeModal"
      @created="
        () => {
          void refetch();
        }
      "
      @updated="
        () => {
          void refetch();
        }
      "
    />
  </div>
</template>
