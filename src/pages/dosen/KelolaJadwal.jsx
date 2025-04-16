import React, { useState } from "react";

const KelolaJadwal = () => {
  const [jadwal, setJadwal] = useState([]);
  const [form, setForm] = useState({
    hari: "",
    jam: "",
    kuota: "",
  });
  const [editIndex, setEditIndex] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.hari || !form.jam || !form.kuota) return alert("Lengkapi semua data!");

    if (editIndex !== null) {
      // mode edit
      const updated = [...jadwal];
      updated[editIndex] = form;
      setJadwal(updated);
      setEditIndex(null);
    } else {
      // mode tambah
      setJadwal([...jadwal, form]);
    }

    setForm({ hari: "", jam: "", kuota: "" });
  };

  const handleEdit = (index) => {
    setForm(jadwal[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const konfirmasi = confirm("Yakin ingin menghapus jadwal ini?");
    if (konfirmasi) {
      const filtered = jadwal.filter((_, i) => i !== index);
      setJadwal(filtered);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Kelola Jadwal Bimbingan</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 shadow rounded mb-6 space-y-4">
        <div>
          <label className="block mb-1">Hari</label>
          <select name="hari" value={form.hari} onChange={handleChange} className="w-full border rounded p-2">
            <option value="">Pilih Hari</option>
            <option value="Senin">Senin</option>
            <option value="Selasa">Selasa</option>
            <option value="Rabu">Rabu</option>
            <option value="Kamis">Kamis</option>
            <option value="Jumat">Jumat</option>
          </select>
        </div>
        <div>
          <label className="block mb-1">Jam</label>
          <input type="time" name="jam" value={form.jam} onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block mb-1">Kuota</label>
          <input type="number" name="kuota" value={form.kuota} onChange={handleChange} className="w-full border rounded p-2" />
        </div>
        <button type="submit" className="bg-[#1277C9] text-white px-4 py-2 rounded">
          {editIndex !== null ? "Simpan Perubahan" : "Tambah"}
        </button>
      </form>

      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-semibold mb-3">Jadwal Bimbingan</h2>
        {jadwal.length === 0 ? (
          <p className="text-gray-500">Belum ada jadwal.</p>
        ) : (
          <ul className="space-y-2">
            {jadwal.map((j, idx) => (
              <li key={idx} className="border p-3 rounded flex justify-between items-center">
                <div>{j.hari}, {j.jam} WIB (Kuota: {j.kuota})</div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(idx)}
                    className="px-2 py-1 text-sm bg-yellow-400 text-white rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(idx)}
                    className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                  >
                    Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default KelolaJadwal;
