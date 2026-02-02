class ToastNotification {
  static container = null;

  static init() {
    if (this.container) return;
    this.container = document.createElement("div");
    this.container.id = "toast-container";
    this.container.style.cssText =
      "position: fixed; top: 20px; right: 20px; z-index: 9999; pointer-events: none;";
    document.body.appendChild(this.container);
  }

  static show(message, type = "info", duration = 3000) {
    this.init();
    const colors = {
      success: "#28a745",
      error: "#dc3545",
      warning: "#ffc107",
      info: "#17a2b8",
    };
    const icons = { success: "✓", error: "✕", warning: "⚠", info: "ℹ" };

    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `background: ${colors[type] || colors.info}; color: white; padding: 16px 20px; margin-bottom: 10px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); animation: slideIn 0.3s ease; pointer-events: auto; display: flex; align-items: center; gap: 12px; min-width: 300px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px;`;

    toast.innerHTML = `<span style="font-size: 20px; flex-shrink: 0;">${icons[type] || icons.info}</span><span style="flex: 1;">${message}</span><button style="background: none; border: none; color: white; cursor: pointer; font-size: 18px; padding: 0; margin-left: 12px; flex-shrink: 0; opacity: 0.7; transition: opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7" onclick="this.parentElement.style.animation='slideOut 0.3s ease'; setTimeout(() => this.parentElement.remove(), 300)">✕</button>`;

    this.container.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => {
        if (toast.parentElement) {
          toast.style.animation = "slideOut 0.3s ease";
          setTimeout(() => toast.remove(), 300);
        }
      }, duration);
    }
  }

  static success(message, duration = 3000) {
    this.show(message, "success", duration);
  }
  static error(message, duration = 4000) {
    this.show(message, "error", duration);
  }
  static warning(message, duration = 3500) {
    this.show(message, "warning", duration);
  }
  static info(message, duration = 3000) {
    this.show(message, "info", duration);
  }
}

const style = document.createElement("style");
style.textContent = `@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(400px); opacity: 0; } } .toast { word-break: break-word; } @media (max-width: 576px) { #toast-container { top: 10px !important; right: 10px !important; left: 10px !important; } .toast { min-width: auto !important; } }`;
document.head.appendChild(style);
