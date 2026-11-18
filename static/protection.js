function handleAjaxError(error) {
    let data = {};

    try {
        data = JSON.parse(error.responseText);
    } catch (e) {
        console.error("Respons server bukan JSON");
    }

    switch (error.status) {
        case 401:
            window.location.href = data.redirect || "/auth/login";
            break;

        case 403:
            if (data.redirect) {
                window.location.href = data.redirect;
            } else {
                webix.message({
                    type: "error",
                    text: data.error || "Akses ditolak"
                });
            }
            break;

        case 400:
            webix.message({
                type: "error",
                text: data.error || "Request tidak valid"
            });
            break;

        case 500:
            webix.message({
                type: "error",
                text: "Terjadi kesalahan pada server"
            });
            break;

        default:
            webix.message({
                type: "error",
                text: "Terjadi kesalahan saat menghubungi server"
            });
    }
}
