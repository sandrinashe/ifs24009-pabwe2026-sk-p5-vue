import { apiFetch } from "../../../helpers/apiHelper";

export const getUsers = () => apiFetch("/users");

export const getMe = () => apiFetch("/users/me");

export const putMe = ({ name, email }) =>
  apiFetch("/users/me", { method: "PUT", body: { name, email } });

export const postPhoto = (file) => {
  const formData = new FormData();
  formData.append("photo", file);
  return apiFetch("/users/me/photo", { method: "POST", formData });
};

// Sesuai dokumentasi Delcom Open API: PUT /users/password
export const putPassword = ({ password, new_password, new_password_confirmation }) =>
  apiFetch("/users/password", {
    method: "PUT",
    body: { password, new_password, new_password_confirmation },
  });
