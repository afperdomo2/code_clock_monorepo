import { SetMetadata } from '@nestjs/common';

export const ALLOW_FIRST_RUN_KEY = 'allowFirstRun';
export const AllowFirstRun = () => SetMetadata(ALLOW_FIRST_RUN_KEY, true);
