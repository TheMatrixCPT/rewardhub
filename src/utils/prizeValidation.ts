
export const validatePrizeForm = (prize: {
  name: string;
  points_required: string;
  registration_start: string;
  registration_end: string;
  deadline: string;
}) => {
  const errors: string[] = [];

  if (!prize.name) {
    errors.push("Prize name is required");
  }
  if (!prize.points_required) {
    errors.push("Points required is required");
  }
  if (!prize.registration_start) {
    errors.push("Registration start date is required");
  }
  if (!prize.registration_end) {
    errors.push("Registration end date is required");
  }
  if (!prize.deadline) {
    errors.push("Competition end date is required");
  }

  if (prize.registration_start) {
    const regStart = new Date(prize.registration_start);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (regStart < now) {
      errors.push("Registration start date must be in the future");
    }
    
    if (regStart.getTime() === now.getTime()) {
      errors.push("Registration start date cannot be today's date");
    }
  }

  if (prize.registration_start && prize.registration_end && prize.deadline) {
    const regStart = new Date(prize.registration_start);
    const regEnd = new Date(prize.registration_end);
    const deadline = new Date(prize.deadline);
    
    if (regStart >= regEnd) {
      errors.push("Registration end date must be after registration start date");
    }
    if (regEnd >= deadline) {
      errors.push("Competition end date must be after registration end date");
    }
  }

  if (prize.points_required) {
    const points = parseInt(prize.points_required);
    if (isNaN(points) || points <= 0) {
      errors.push("Points required must be a positive number");
    }
  }

  return errors;
};
