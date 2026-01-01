'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-daily-health-report.flow';
