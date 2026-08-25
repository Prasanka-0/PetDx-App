
const API_BASE_URL = 'http://10.42.137.91:5000';

export async function initDatabase() {
  return true;
}

export async function prepopulateBreeds() {
  return true;
}

export async function prepopulateDiseases() {
  return true;
}

export async function getAllScans() {
  try {
    const response = await fetch(`${API_BASE_URL}/scans`);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('getAllScans error:', error);
    return [];
  }
}

export async function deleteScan(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/scans/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return true;
  } catch (error) {
    console.error('deleteScan error:', error);
    return false;
  }
}