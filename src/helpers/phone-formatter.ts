export const phoneFormatter = (phone: string): string => {
  let formattedPhone = phone.toString().replace(/\D/g, '');
  if (formattedPhone.length === 9) return '998' + formattedPhone;
  if (formattedPhone.length === 12) return formattedPhone;
  return formattedPhone;
};
