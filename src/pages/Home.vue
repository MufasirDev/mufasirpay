<template>
  <div class="app">
<!-- NAVBAR -->
<nav class="navbar">
  <div class="logo">
    <img
      src="/logo.png"
      alt="MufasirPay"
      class="full-logo"
    />
  </div>

  <!-- your existing navbar links remain here -->


      <div class="nav-links">
        <a href="#features">Features</a>
        <a href="#security">Security</a>
        <a href="#about">About</a>
      </div>

      <div class="nav-actions">
        <router-link to="/login" class="login-btn">
  Log In
</router-link>

<router-link to="/register" class="signup-btn">
  Create Account
</router-link>
</div>
    </nav>

    <!-- HERO -->
    <main>

      <section class="hero">
        <div class="hero-content">

          <div class="badge">
            <span class="badge-dot"></span>
            Simple. Secure. Smart.
          </div>

          <h1>
            Your money.
            <span>Your control.</span>
          </h1>

          <p>
            MufasirPay gives you a simple and secure way to manage your
            money, transfer funds, pay bills and keep track of your finances
            from one powerful wallet.
          </p>

          <div class="hero-buttons">
            <router-link to="/register" class="primary-btn">
  Create Free Account
  <span>→</span>
</router-link>

            <button class="secondary-btn">
              Explore Features
            </button>
          </div>

          <div class="trust">
            <div class="avatars">
              <div>U</div>
              <div>M</div>
              <div>A</div>
              <div>+</div>
            </div>

            <div>
              <strong>Built for everyday payments</strong>
              <small>Fast, simple and secure</small>
            </div>
          </div>

        </div>

        <!-- WALLET CARD -->
        <div class="hero-card-wrapper">

          <div class="floating-card card-top">
            <span>↗</span>
            <div>
              <small>Money Received</small>
              <strong>+ ₦25,000</strong>
            </div>
          </div>

          <div class="wallet-card">

            <div class="wallet-header">
              <div>
                <small>Available Balance</small>
                <h2>₦248,500.00</h2>
              </div>

              <div class="eye">◉</div>
            </div>

            <div class="card-number">
              •••• &nbsp; •••• &nbsp; •••• &nbsp; 4821
            </div>

            <div class="wallet-bottom">
              <div>
                <small>ACCOUNT HOLDER</small>
                <strong>Mufasir User</strong>
              </div>

              <div class="master-symbol">
                <i></i>
                <i></i>
              </div>
            </div>

          </div>

          <div class="floating-card card-bottom">
            <div class="transaction-icon">↙</div>

            <div>
              <small>Transfer Sent</small>
              <strong>- ₦8,500</strong>
            </div>

            <span class="success">Successful</span>
          </div>

        </div>
      </section>

      <!-- FEATURES -->
      <section id="features" class="features-section">

        <div class="section-heading">
          <span>EVERYTHING YOU NEED</span>
          <h2>One wallet. <strong>More possibilities.</strong></h2>
          <p>
            Manage your everyday finances with tools designed to make
            your financial life easier.
          </p>
        </div>

        <div class="features-grid">

          <div class="feature-card">
            <div class="feature-icon">₦</div>
            <h3>Digital Wallet</h3>
            <p>
              Keep your money in one secure wallet and access your balance
              whenever you need it.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">↗</div>
            <h3>Instant Transfers</h3>
            <p>
              Send money quickly to other MufasirPay users with just a few
              simple steps.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">▣</div>
            <h3>Pay Bills</h3>
            <p>
              Airtime, data, electricity and other everyday payments from
              one convenient place.
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">⌁</div>
            <h3>Track Spending</h3>
            <p>
              View your transaction history and understand where your
              money goes.
            </p>
          </div>

        </div>

      </section>

      <!-- SECURITY -->
      <section id="security" class="security-section">

        <div class="security-content">

          <span>SECURITY FIRST</span>

          <h2>
            Your money deserves
            <strong>strong protection.</strong>
          </h2>

          <p>
            MufasirPay is designed with security in mind. Your account,
            transactions and personal information are protected using
            modern security practices.
          </p>

          <div class="security-items">
            <div>
              <b>✓</b>
              <span>Secure authentication</span>
            </div>

            <div>
              <b>✓</b>
              <span>Protected financial data</span>
            </div>

            <div>
              <b>✓</b>
              <span>Transaction verification</span>
            </div>
          </div>

        </div>

        <div class="security-visual">
          <div class="shield">
            <div>✓</div>
          </div>

          <div class="secure-label">
            <span>🔒</span>
            <div>
              <strong>Protected</strong>
              <small>Your account is secure</small>
            </div>
          </div>
        </div>

      </section>

      <!-- CTA -->
      <section id="about" class="cta-section">

        <div>
          <span>READY TO GET STARTED?</span>

          <h2>
            Take control of
            <strong>your money.</strong>
          </h2>

          <p>
            Create your MufasirPay account and experience a simpler way
            to manage your finances.
          </p>
        </div>

        <router-link to="/register" class="cta-button">
  Create Your Account →
</router-link>

      </section>

    </main>

    
    <footer>
      <div class="footer-logo">
        <div class="logo-icon">M</div>
        <span>Mufasir<span>Pay</span></span>
      </div>

      <p>Simple, secure and smarter digital payments.</p>

      <div class="footer-copy">
        © 2026 MufasirPay. All rights reserved.
      </div>
    </footer>

  </div>
</template>

