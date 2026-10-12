<template>
  <div class="support-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">WE'RE HERE TO HELP</p>
        <h1>Help &amp; Support</h1>
        <p class="subtitle">Find answers, contact our team, or report a transaction issue.</p>
      </div>
      <div class="header-icon" aria-hidden="true">💬</div>
    </header>

    <section class="contact-grid">
      <article class="contact-card">
        <div class="contact-icon whatsapp-icon">◉</div>
        <div class="contact-copy">
          <h2>Chat on WhatsApp</h2>
          <p>Contact support directly for help with your account or transactions.</p>
          <a class="contact-link" :href="whatsappUrl" target="_blank" rel="noopener noreferrer">Chat with support <span>↗</span></a>
        </div>
      </article>
      <article class="contact-card">
        <div class="contact-icon email-icon">✉</div>
        <div class="contact-copy">
          <h2>Email support</h2>
          <p>Send us the details of your question and our team can follow up.</p>
          <a class="contact-link" :href="emailUrl">Send an email <span>↗</span></a>
        </div>
      </article>
    </section>

    <section class="support-card">
      <div class="section-heading">
        <div class="heading-icon">▤</div>
        <div>
          <h2>Report a transaction issue</h2>
          <p>Share the details below. Do not include your password, PIN, or OTP.</p>
        </div>
      </div>

      <form @submit.prevent="submitIssue">
        <div class="form-grid">
          <div class="field">
            <label for="issueType">Issue type</label>
            <select id="issueType" v-model="form.issueType" required>
              <option value="">Select an issue</option>
              <option>Wallet funding</option>
              <option>Money transfer</option>
              <option>Airtime purchase</option>
              <option>Data purchase</option>
              <option>Bill payment</option>
              <option>Other</option>
            </select>
          </div>
          <div class="field">
            <label for="reference">Transaction reference (if available)</label>
            <input id="reference" v-model.trim="form.reference" maxlength="100" placeholder="Enter transaction reference" />
          </div>
          <div class="field">
            <label for="amount">Amount (₦, optional)</label>
            <input id="amount" v-model.trim="form.amount" inputmode="decimal" placeholder="e.g. 2500" />
          </div>
          <div class="field">
            <label for="emailAddress">Your email address (optional)</label>
            <input id="emailAddress" v-model.trim="form.email" type="email" maxlength="254" placeholder="you@example.com" />
          </div>
        </div>
        <div class="field">
          <label for="description">Describe the problem</label>
          <textarea id="description" v-model.trim="form.description" rows="5" minlength="10" maxlength="1500" required placeholder="Tell us what happened, including the date and any message you saw."></textarea>
          <p class="field-hint">{{ form.description.length }}/1500 characters</p>
        </div>

        <div v-if="feedback" class="feedback" :class="feedbackType" role="status" aria-live="polite">{{ feedback }}</div>
        <button class="primary-button" type="submit" :disabled="sending">
          {{ sending ? 'Preparing report…' : 'Send issue to support' }}
        </button>
        <p class="form-note">This opens your email app with the report filled in. Review it and press Send to submit it to support.</p>
      </form>
    </section>

    <section class="support-card faq-card">
      <div class="section-heading">
        <div class="heading-icon">?</div>
        <div>
          <h2>Frequently Asked Questions</h2>
          <p>Quick answers to common MufasirPay questions.</p>
        </div>
      </div>

      <div class="faq-list">
        <details v-for="faq in faqs" :key="faq.question" class="faq-item">
          <summary>{{ faq.question }}<span class="faq-plus">+</span></summary>
          <p>{{ faq.answer }}</p>
        </details>
      </div>
    </section>

    <button class="back-button" type="button" @click="router.push('/dashboard')">← Back to Dashboard</button>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const supportPhone = '2348093963715'
const supportEmail = 'muhsinadebayo366@gmail.com'
const whatsappUrl = `https://wa.me/${supportPhone}`
const emailUrl = `mailto:${supportEmail}`

const form = reactive({
  issueType: '',
  reference: '',
  amount: '',
  email: '',
  description: ''
})
const sending = ref(false)
const feedback = ref('')
const feedbackType = ref<'success' | 'error'>('success')

const faqs = [
  {
    question: 'What should I do if a transaction is pending?',
    answer: 'Check your Transactions page for the latest status. Avoid repeating the same payment while it is pending. If it does not resolve, report the issue above with the transaction reference, if available.'
  },
  {
    question: 'My wallet funding payment was successful but my balance has not changed. What should I do?',
    answer: 'Check your transaction history first. If your balance still has not updated, contact support with the payment reference and amount. Never send your card PIN, password, or one-time password.'
  },
  {
    question: 'What details should I include when reporting a failed transaction?',
    answer: 'Include the transaction type, approximate date and time, amount, reference if available, and the error message shown. Do not include your password, transaction PIN, card security code, or OTP.'
  },
  {
    question: 'Can I share my password or OTP with support?',
    answer: 'No. Never share your password, transaction PIN, OTP, recovery code, or full card security details with anyone, including someone claiming to be support.'
  },
  {
    question: 'How do I change my account password?',
    answer: 'Open Security Center from your account and use the Change Password form. Choose a strong password that you do not use on other services.'
  },
  {
    question: 'How can I contact MufasirPay support?',
    answer: 'Use the WhatsApp or email contact options at the top of this page. For transaction issues, include the relevant reference and a clear description of what happened.'
  }
]

function submitIssue() {
  feedback.value = ''

  if (form.description.trim().length < 10) {
    feedbackType.value = 'error'
    feedback.value = 'Please describe the issue in at least 10 characters.'
    return
  }

  if (form.amount && (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0)) {
    feedbackType.value = 'error'
    feedback.value = 'Enter a valid positive amount, or leave the amount field empty.'
    return
  }

  sending.value = true
  try {
    const subject = `MufasirPay support: ${form.issueType}`
    const body = [
      'Hello MufasirPay Support,',
      '',
      'I would like to report a transaction issue.',
      `Issue type: ${form.issueType}`,
      `Transaction reference: ${form.reference || 'Not provided'}`,
      `Amount: ${form.amount ? `NGN ${form.amount}` : 'Not provided'}`,
      `Reply email: ${form.email || 'Please reply to the email account I send this from'}`,
      '',
      'Description:',
      form.description.trim(),
      '',
      'I have not included any password, PIN, or OTP.'
    ].join('\n')

    const mailto = `mailto:${supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
    feedbackType.value = 'success'
    feedback.value = 'Your email app should open with the report prepared. Review it and press Send to submit it.'
  } catch (error) {
    console.error('Could not prepare support email:', error)
    feedbackType.value = 'error'
    feedback.value = 'Could not open your email app. Please contact support using the email link above.'
  } finally {
    sending.value = false
  }
}
</script>

<style scoped>
* { box-sizing: border-box; }
.support-page { min-height: 100vh; padding: 36px; background: #f7faf8; color: #172a21; font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
.page-header { display: flex; justify-content: space-between; align-items: center; gap: 20px; max-width: 1000px; margin: 0 auto 26px; }
.eyebrow { margin: 0 0 8px; color: #0b9860; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; }
.page-header h1 { margin: 0; font-size: clamp(26px, 4vw, 34px); letter-spacing: -0.8px; }
.subtitle { margin: 9px 0 0; color: #78877f; font-size: 13px; line-height: 1.6; }
.header-icon { display: grid; place-items: center; flex-shrink: 0; width: 58px; height: 58px; border-radius: 18px; background: #e4f7ec; font-size: 26px; }
.contact-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; max-width: 1000px; margin: 0 auto 20px; }
.contact-card, .support-card { min-width: 0; border: 1px solid #e5eee8; border-radius: 20px; background: #fff; box-shadow: 0 8px 24px rgba(9, 71, 46, .04); }
.contact-card { display: flex; align-items: flex-start; gap: 15px; padding: 22px; }
.contact-icon, .heading-icon { display: grid; place-items: center; flex-shrink: 0; width: 44px; height: 44px; border-radius: 14px; background: #e5f9ef; color: #087b51; font-size: 20px; font-weight: 800; }
.whatsapp-icon { background: #e5f7eb; color: #087b51; }
.email-icon { background: #edf5f0; }
.contact-copy { min-width: 0; }
.contact-copy h2 { margin: 2px 0 7px; font-size: 15px; }
.contact-copy p { margin: 0 0 13px; color: #7d8b83; font-size: 12px; line-height: 1.7; }
.contact-link { display: inline-flex; align-items: center; gap: 8px; color: #087b51; font-size: 12px; font-weight: 800; text-decoration: none; }
.contact-link:hover { color: #065f3e; text-decoration: underline; }
.support-card { max-width: 1000px; margin: 0 auto 20px; padding: 26px; }
.section-heading { display: flex; align-items: center; gap: 13px; margin-bottom: 24px; }
.section-heading h2 { margin: 0; font-size: 17px; }
.section-heading p { margin: 5px 0 0; color: #87938c; font-size: 12px; line-height: 1.6; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 16px; }
.field { min-width: 0; margin-bottom: 18px; }
.field label { display: block; margin-bottom: 8px; font-size: 12px; font-weight: 700; }
.field input, .field select, .field textarea { display: block; width: 100%; min-width: 0; padding: 12px 13px; border: 1px solid #dfe9e3; border-radius: 11px; outline: none; background: #fff; color: #172a21; font: inherit; font-size: 12px; transition: border-color .2s, box-shadow .2s; }
.field textarea { resize: vertical; line-height: 1.6; }
.field input:focus, .field select:focus, .field textarea:focus { border-color: #0a9b61; box-shadow: 0 0 0 3px rgba(10, 155, 97, .09); }
.field input::placeholder, .field textarea::placeholder { color: #a2ada6; }
.field-hint { margin: 6px 0 0; color: #87938c; font-size: 10px; text-align: right; }
.primary-button { width: 100%; padding: 14px 18px; border: 0; border-radius: 12px; background: linear-gradient(135deg, #0eaa69, #087b51); color: #fff; font-size: 13px; font-weight: 800; cursor: pointer; }
.primary-button:hover:not(:disabled) { box-shadow: 0 8px 18px rgba(8, 123, 81, .18); }
.primary-button:disabled { opacity: .65; cursor: not-allowed; }
.form-note { margin: 11px 0 0; color: #87938c; font-size: 11px; line-height: 1.6; }
.feedback { margin: 0 0 14px; padding: 12px 14px; border: 1px solid transparent; border-radius: 11px; font-size: 12px; line-height: 1.6; }
.feedback.success { color: #087b51; background: #edf9f2; border-color: #d5efdf; }
.feedback.error { color: #92551c; background: #fff7e9; border-color: #f3dfbd; }
.faq-card { margin-top: 20px; }
.faq-list { border-top: 1px solid #edf2ee; }
.faq-item { border-bottom: 1px solid #edf2ee; }
.faq-item:last-child { border-bottom: 0; }
.faq-item summary { display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 17px 2px; color: #21382d; font-size: 13px; font-weight: 700; cursor: pointer; list-style: none; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-plus { flex-shrink: 0; color: #087b51; font-size: 20px; font-weight: 500; transition: transform .2s; }
.faq-item[open] .faq-plus { transform: rotate(45deg); }
.faq-item p { margin: -3px 28px 17px 2px; color: #78877f; font-size: 12px; line-height: 1.8; }
.back-button { display: block; max-width: 1000px; margin: 25px auto 0; padding: 10px 0; border: 0; background: transparent; color: #087b51; font-size: 12px; font-weight: 800; cursor: pointer; }
.back-button:hover { color: #065f3e; }
@media (max-width: 700px) { .support-page { padding: 22px 16px 35px; } .contact-grid, .form-grid { grid-template-columns: 1fr; } .page-header { align-items: flex-start; } .header-icon { width: 46px; height: 46px; border-radius: 14px; font-size: 21px; } .support-card { padding: 20px 17px; } .contact-card { padding: 19px; } }
</style>
