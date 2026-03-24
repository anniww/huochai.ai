(function () {
  function toast(msg) {
    const div = document.createElement('div');
    div.className = 'toast';
    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2600);
  }

  document.querySelectorAll('[data-copy-wechat]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const wechat = btn.getAttribute('data-copy-wechat') || '';
      try {
        await navigator.clipboard.writeText(wechat);
        toast(`微信已复制：${wechat}`);
      } catch {
        toast(`请手动复制微信：${wechat}`);
      }
    });
  });

  const form = document.querySelector('[data-chat-form]');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      const message = [
        '你好，我想咨询 AI 外贸获客软件。',
        data.name ? `姓名: ${data.name}` : '',
        data.company ? `公司: ${data.company}` : '',
        data.country ? `国家: ${data.country}` : '',
        data.need ? `需求: ${data.need}` : ''
      ].filter(Boolean).join('\n');
      const encoded = encodeURIComponent(message);
      const target = form.querySelector('input[name="target"]:checked')?.value || 'whatsapp';
      if (target === 'telegram') {
        window.open(`https://t.me/aiclawchuhai`, '_blank');
        try { await navigator.clipboard.writeText(message); toast('已打开 Telegram，请把消息粘贴发送。'); } catch { toast('已打开 Telegram。'); }
      } else if (target === 'wechat') {
        try { await navigator.clipboard.writeText(message); toast('咨询内容已复制，请粘贴到微信。'); } catch { toast('请手动复制咨询内容。'); }
      } else {
        window.open(`https://wa.me/85252195605?text=${encoded}`, '_blank');
      }
    });
  }
})();
