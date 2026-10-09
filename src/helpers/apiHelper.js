const TOKEN_KEY = "delcom_access_token";

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);

export const putAccessToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const removeAccessToken = () => localStorage.removeItem(TOKEN_KEY);

const buildUrl = (path, query = {}) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (![undefined, null, ""].includes(value)) {
      params.append(key, value);
    }
  });
  const queryString = params.toString();
  return `${DELCOM_BASEURL}${path}${queryString ? `?${queryString}` : ""}`;
};

/**
 * Wrapper fetch ke REST API Delcom.
 * Selalu mengembalikan { success, message, data } dan tidak pernah melempar error.
 */
export async function apiFetch(path, { method = "GET", body, query, formData } = {}) {
  const headers = { Accept: "application/json" };
  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let payload = formData;
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  try {
    const response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: payload,
    });
    const json = await response.json();
    const fields = json.data?.field;
    return {
      success: json.status === "success",
      message: fields ? fields.join(", ") : json.message,
      data: json.data ?? {},
    };
  } catch {
    return {
      success: false,
      message: "Tidak dapat terhubung ke server",
      data: {},
    };
  }
}
