import { BadRequestException } from '@nestjs/common';
import { formatInTimeZone, toDate } from 'date-fns-tz';

export function convertToUtc(dateTime: Date | string, timeZone: string = 'Asia/Bangkok'): Date {
  const date = typeof dateTime === 'string' ? toDate(dateTime) : dateTime;
  const formattedDate = formatInTimeZone(date, timeZone, 'yyyy-MM-dd\'T\'HH:mm:ssXXX');
  return new Date(formattedDate);
}

export function convertToBangkokTime(dateTime: Date | string): Date {
  const date = typeof dateTime === 'string' ? toDate(dateTime) : dateTime;
  const formattedDate = formatInTimeZone(date, 'Asia/Bangkok', 'yyyy-MM-dd\'T\'HH:mm:ssXXX');
  return new Date(formattedDate);
}

export function validateDateTimes2(startDateTime: Date, endDateTime: Date): void {
  const now = new Date();
  const seventyTwoHoursFromNow = new Date(now.getTime() + 72 * 60 * 60 * 1000);
  const oneHour = 60 * 60 * 1000;
  const twentyFourHours = 24 * 60 * 60 * 1000;

  if (endDateTime < startDateTime) {
    throw new BadRequestException('The start time must be before the end time.');
  }
  if (startDateTime < now || endDateTime < now) {
    throw new BadRequestException('Date and time cannot be in the past');
  }
  if (startDateTime < seventyTwoHoursFromNow) {
    throw new BadRequestException('The start time must be at least 72 hours from now.');
  }
  const duration = endDateTime.getTime() - startDateTime.getTime();
  if (duration < oneHour || duration > twentyFourHours) {
    throw new BadRequestException('The duration of the activity must be between 1 hour and 24 hours.');
  }
}

export function validateDateTimes(startDateTime: Date, endDateTime: Date): void {
  const now = new Date();
  const twoMinFromNow = new Date(now.getTime() + 3 * 60 * 1000);
  const min = 10 * 60 * 1000;
  const max = 60 * 60 * 1000;

  if (endDateTime < startDateTime) {
    throw new BadRequestException('The start time must be before the end time.');
  }
  if (startDateTime < now || endDateTime < now) {
    throw new BadRequestException('Date and time cannot be in the past');
  }
  if (startDateTime < twoMinFromNow) {
    throw new BadRequestException('The start time must be at least 2 mins from now.');
  }
  const duration = endDateTime.getTime() - startDateTime.getTime();
  if (duration < min || duration > max) {
    throw new BadRequestException('The duration of the activity must be between 10 mins and 1 hour.');
  }
}

export function validateAndConvertDateTimes2(
  startDateTime: Date,
  endDateTime: Date,
  dbTimeZone: string = 'UTC'
): { startDateTimeUtc: Date; endDateTimeUtc: Date } {
  const startDate = toDate(startDateTime);
  const endDate = toDate(endDateTime);

  // Convert to user's timezone for validation
  const startDateInUserTimeZone = convertToBangkokTime(startDate);
  const endDateInUserTimeZone = convertToBangkokTime(endDate);

  // Validate date-times in user's timezone
  validateDateTimes(startDateInUserTimeZone, endDateInUserTimeZone);

  // Convert to UTC for storage
  const startDateTimeUtc = convertToUtc(startDate, dbTimeZone);
  const endDateTimeUtc = convertToUtc(endDate, dbTimeZone);

  return { startDateTimeUtc, endDateTimeUtc };
}

export function validateAndConvertDateTimes(
  startDateTime: Date,
  endDateTime: Date,
  dbTimeZone: string = 'UTC'
): { startDateTimeUtc: Date; endDateTimeUtc: Date } {
  const startDate = toDate(startDateTime);
  const endDate = toDate(endDateTime);

  // Validate date-times in user's timezone
  validateDateTimes(startDate, endDate);

  // Convert to UTC for storage
  const startDateTimeUtc = convertToUtc(startDate, dbTimeZone);
  const endDateTimeUtc = convertToUtc(endDate, dbTimeZone);

  return { startDateTimeUtc, endDateTimeUtc };
}