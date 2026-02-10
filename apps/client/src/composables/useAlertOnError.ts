import Swal from 'sweetalert2';
import type { Ref } from 'vue';
import { watch } from 'vue';
import { getApiErrorMessage } from '../services/api';

export const useAlertOnError = (error: Ref<unknown>, title = 'Error') => {
  watch(error, (value) => {
    if (!value) return;
    Swal.fire({
      icon: 'error',
      title,
      text: getApiErrorMessage(value),
    });
  });
};
