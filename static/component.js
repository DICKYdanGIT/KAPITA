function cardHtml(total, header, description) {
    return `
        <div style="padding:16px; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; height:100%; box-sizing:border-box;">
            <div style="color:#64748b; font-size:13px;">${header}</div>

            <div style="font-size:27px; font-weight:700; margin-top:12px; color:#1e293b;">
                ${Number(total).toLocaleString("id-ID")}
            </div>

            <div style="font-size:11px; color:#94a3b8; margin-top:5px;">${description}</div>
        </div>
    `;
}