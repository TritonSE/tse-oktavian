import { sendData, getData } from "../util/data";

export async function getUsers() {
  return getData("api/users", true);
}

export async function editUser(body) {
  return sendData("api/users", true, "PUT", JSON.stringify(body));
}

export async function deleteUser(id) {
  return sendData(`api/users/${id}`, true, "DELETE", JSON.stringify());
}
