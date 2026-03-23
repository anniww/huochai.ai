document.querySelectorAll('.copy-btn').forEach((button) => {
  button.addEventListener('click', async () => {
    const value = button.getAttribute('data-copy');
    try {
      await navigator.clipboard.writeText(value);
      const oldText = button.innerHTML;
      button.innerHTML = oldText.includes('strong')
        ? oldText.replace(value, '已复制')
        : '已复制微信号';
      setTimeout(() => {
        button.innerHTML = oldText;
      }, 1800);
    } catch (error) {
      window.prompt('请手动复制微信号：', value);
    }
  });
});
