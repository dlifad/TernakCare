export function formatRupiah(number) {
    if (!number) return "Rp0";

    return "Rp" + Number(number).toLocaleString("id-ID");
}
