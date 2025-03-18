export const fetchData = async (fileName) => {
    try {
      const response = await fetch(`/data/${fileName}.json`);
      if (!response.ok) throw new Error("Gagal mengambil data");
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  };
  