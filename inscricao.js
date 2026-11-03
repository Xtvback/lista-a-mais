/* Inscrição de Associados APEE — feedback transparente e sem perda dos dados.
 * Nunca declara sucesso sem confirmação explícita do serviço.
 * Não faz retries automáticos (evita inscrições duplicadas). */
(() => {
  const form = document.getElementById('inscricaoForm');
  const status = document.getElementById('inscricaoEstado');
  const button = form?.querySelector('button[type="submit"]');
  if (!form || !status || !button) return;

  const defaultLabel = button.innerHTML;
  const emailAddress = 'apee.bairro.restelo@gmail.com';

  function show(message, kind) {
    status.textContent = message;
    status.hidden = false;
    status.className = 'signup-delivery-status signup-delivery-status--' + kind;
    status.scrollIntoView({ block:'nearest', behavior:'auto' });
  }
  function setBusy(busy) {
    button.disabled = busy;
    button.setAttribute('aria-busy', String(busy));
    button.innerHTML = busy ? 'A verificar o envio…' : defaultLabel;
  }

  form.addEventListener('submit', async event => {
    if (!form.reportValidity()) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    if (button.disabled) return;
    setBusy(true);
    show('A enviar o pedido à APEE. Aguarde pela confirmação de receção.', 'loading');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 18000);
    try {
      const data = {};
      for (const [name, value] of new FormData(form)) {
        data[name] = value;
      }
      // O endpoint AJAX devolve uma confirmação verificável em JSON.
      const response = await fetch('https://formsubmit.co/ajax/' + emailAddress, {
        method:'POST',
        mode:'cors',
        headers:{'Content-Type':'application/json', 'Accept':'application/json'},
        body:JSON.stringify(data),
        signal:controller.signal
      });
      let result;
      try { result = await response.json(); }
      catch (_) { throw new Error('INVALID_RESPONSE'); }

      const accepted = response.ok &&
        (result?.success === true || result?.success === 'true');
      if (!accepted) {
        const detail = String(result?.message || result?.error || '');
        if (/activat|confirm.*email|verify.*email/i.test(detail)) {
          show('A receção de inscrições ainda necessita de ativação no email institucional da APEE. O seu pedido não foi confirmado. Contacte a Associação pelo email indicado abaixo.', 'error');
        } else if (/captcha|robot|spam/i.test(detail)) {
          show('O serviço de formulários pediu uma verificação de segurança que não foi possível concluir aqui. O envio não foi confirmado. Contacte a APEE pelo email indicado abaixo.', 'error');
        } else {
          show('Não foi possível confirmar a receção da inscrição. Não precisa de voltar a preencher: os seus dados permanecem neste formulário. Contacte a APEE pelo email indicado abaixo.', 'error');
        }
        return;
      }

      show('Pedido recebido pelo serviço de formulários. A entrega ao email e a inscrição definitiva serão confirmadas pela APEE.', 'success');
      // A página seguinte indica apenas receção pelo serviço, nunca adesão concluída.
      window.location.assign('/inscricao-recebida.html');
    } catch (error) {
      const message = error?.name === 'AbortError'
        ? 'O serviço de envio demorou demasiado a responder. Não sabemos se recebeu o pedido. Para evitar inscrições duplicadas, confirme primeiro com a APEE através do email indicado abaixo.'
        : 'O serviço de envio está indisponível ou não respondeu corretamente. Não foi possível confirmar a receção. Mantenha esta página aberta e contacte a APEE através do email indicado abaixo.';
      show(message, 'error');
    } finally {
      clearTimeout(timeout);
      setBusy(false);
    }
  });
})();