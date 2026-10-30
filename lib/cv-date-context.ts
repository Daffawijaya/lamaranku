export function cvDateContext(now = new Date()) {
  const date = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Singapore", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  return `Tanggal review saat ini: ${date} (Asia/Singapore). Gunakan tanggal ini, bukan asumsi tahun dari pengetahuan model. Tahun proyek/pengalaman yang sama dengan tahun sekarang adalah valid. Jangan menyebut suatu tahun salah hanya karena masih baru. Perubahan tanggal hanya boleh disarankan jika ada kontradiksi nyata dalam dokumen. Tanggal masa depan dapat berarti rencana atau perkiraan selesai: minta klarifikasi jika konteksnya tidak jelas, jangan langsung mengurangi nilai atau menggantinya dengan tahun lain. Jangan mengarang tahun pengganti.\n`;
}
