import Swal from 'sweetalert2';

interface ConfirmOptions {
  title: string;
  text: string;
  confirmText: string;
  cancelText: string;
  danger?: boolean;
}

export async function confirmAction(opts: ConfirmOptions): Promise<boolean> {
  const isDark = document.documentElement.classList.contains('dark');

  const result = await Swal.fire({
    title: opts.title,
    text: opts.text,
    icon: opts.danger ? 'warning' : 'question',
    iconColor: opts.danger ? '#ef4444' : (isDark ? '#60a5fa' : '#3b82f6'),
    showCancelButton: true,
    confirmButtonText: opts.confirmText,
    cancelButtonText: opts.cancelText,
    reverseButtons: true,
    // var() resolves against :root so dark/light switches automatically
    background: 'var(--background)',
    color: 'var(--foreground)',
    customClass: {
      popup: 'swal-glass',
      icon: 'swal-icon',
      title: 'swal-title',
      htmlContainer: 'swal-text',
      actions: 'swal-actions',
      confirmButton: opts.danger ? 'swal-btn-danger' : 'swal-btn-primary',
      cancelButton: 'swal-btn-secondary',
    },
    buttonsStyling: false,
  });

  return result.isConfirmed;
}
