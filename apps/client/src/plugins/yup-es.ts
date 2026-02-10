import * as yup from 'yup';

yup.setLocale({
  mixed: {
    default: 'No es válido',
    required: 'Este campo es obligatorio',
    oneOf: 'Debe ser uno de los siguientes valores: ${values}',
    notOneOf: 'No debe ser uno de los siguientes valores: ${values}',
    notType: ({ type, value, originalValue }) => {
      const isCast = originalValue != null && originalValue !== value;
      let msg =
        `${
          `El campo debe ser un tipo \`${type}\`, ` +
          `pero el valor final fue: \`${printValue(value, true)}\``
        } ` +
        (isCast
          ? ` (cast del valor \`${printValue(originalValue, true)}\`).`
          : '.');

      if (value === null) {
        msg +=
          '\n Si "null" es intencionado como un valor vacío, asegúrese de marcar el esquema como `.nullable()`';
      }

      return msg;
    },
    defined: 'Debe estar definido',
  },
  string: {
    length: 'Debe tener exactamente ${length} caracteres',
    min: 'Debe tener al menos ${min} caracteres',
    max: 'Debe tener como máximo ${max} caracteres',
    matches: 'Debe coincidir con el siguiente formato: "${regex}"',
    email: 'Debe ser un correo electrónico válido',
    url: 'Debe ser una URL válida',
    uuid: 'Debe ser un UUID válido',
    trim: 'No debe contener espacios al inicio ni al final',
    lowercase: 'Debe estar en minúsculas',
    uppercase: 'Debe estar en mayúsculas',
  },
  number: {
    min: 'Debe ser mayor o igual a ${min}',
    max: 'Debe ser menor o igual a ${max}',
    lessThan: 'Debe ser menor a ${less}',
    moreThan: 'Debe ser mayor a ${more}',
    positive: 'Debe ser un número positivo',
    negative: 'Debe ser un número negativo',
    integer: 'Debe ser un número entero',
  },
  date: {
    min: 'Debe ser posterior a ${min}',
    max: 'Debe ser anterior a ${max}',
  },
  boolean: {
    isValue: 'Debe ser ${value}',
  },
  object: {
    noUnknown: 'Tiene claves no especificadas en la forma del objeto',
  },
  array: {
    min: 'Debe tener al menos ${min} elementos',
    max: 'Debe tener como máximo ${max} elementos',
    length: 'Debe tener exactamente ${length} elementos',
  },
});

function printValue(value: unknown, quoteStrings: boolean): string {
  const type = typeof value;
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (type === 'number' || type === 'boolean') return String(value);
  if (type === 'string') return quoteStrings ? `"${value}"` : (value as string);
  if (type === 'symbol') return (value as symbol).toString();
  if (type === 'function')
    return `[Function ${(value as () => void).name || 'anonymous'}]`;
  return type;
}
