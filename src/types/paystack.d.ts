declare module '@paystack/inline-js' {
  export default class Paystack {
    resumeTransaction(accessCode: string): void

    newTransaction(options: {
      key: string
      email: string
      amount: number
      currency?: string
      ref?: string
      callback?: (response: { reference: string }) => void
      onClose?: () => void
      [key: string]: any
    }): void
  }
}