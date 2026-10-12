
<template>
  <div class="notifications-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">MU FASIRPAY UPDATES</p>
        <h1>Notifications</h1>
        <p class="subtitle">
          Stay informed about your wallet and transactions.
        </p>
      </div>

      <button
        class="mark-all-button"
        :disabled="unreadCount === 0 || loading"
        @click="markAllAsRead"
      >
        Mark all as read
      </button>
    </header>

    <section class="summary-card">
      <div class="summary-icon">🔔</div>
      <div>
        <p class="summary-label">Unread notifications</p>
        <h2>{{ unreadCount }}</h2>
      </div>
    </section>

    <nav class="filters" aria-label="Notification filters">
      <button
        v-for="filter in filters"
        :key="filter.value"
        :class="{ active: activeFilter === filter.value }"
        @click="activeFilter = filter.value"
      >
        {{ filter.label }}
        <span v-if="filter.value === 'unread'">
          {{ unreadCount }}
        </span>
      </button>
    </nav>

    <div v-if="loading" class="state-card">
      <div class="spinner"></div>
      <p>Loading your notifications...</p>
    </div>

    <div v-else-if="errorMessage" class="state-card error-state">
      <h3>Unable to load notifications</h3>
      <p>{{ errorMessage }}</p>
      <button class="retry-button" @click="loadNotifications">
        Try again
      </button>
    </div>

    <div v-else-if="filteredNotifications.length === 0" class="state-card empty-state">
      <div class="empty-icon">🔔</div>
      <h3>
        {{
          activeFilter === 'unread'
            ? 'You are all caught up!'
            : activeFilter === 'read'
              ? 'No read notifications yet'
              : 'No notifications yet'
        }}
      </h3>
      <p>
        Transaction and account updates will appear here when available.
      </p>
    </div>

    <section v-else class="notification-list">
      <article
        v-for="notification in filteredNotifications"
        :key="notification.id"
        class="notification-card"
        :class="{
          unread: !notification.read_at,
          [`status-${notification.status}`]: true
        }"
      >
        <div class="notification-icon">
          {{ categoryIcon(notification.category) }}
        </div>

        <div class="notification-content">
          <div class="notification-heading">
            <h3>{{ notification.title }}</h3>
            <span v-if="!notification.read_at" class="unread-dot"></span>
          </div>

          <p class="notification-message">
            {{ notification.message }}
          </p>

          <div class="notification-meta">
            <span class="category-label">
              {{ categoryLabel(notification.category) }}
            </span>
            <span>·</span>
            <time :datetime="notification.created_at">
              {{ formatDate(notification.created_at) }}
            </time>
          </div>

          <p v-if="notification.reference" class="reference">
            Reference: {{ notification.reference }}
          </p>
        </div>

        <button
          v-if="!notification.read_at"
          class="read-button"
          :disabled="updatingIds.includes(notification.id)"
          :aria-label="`Mark ${notification.title} as read`"
          title="Mark as read"
          @click="markAsRead(notification)"
        >
          {{ updatingIds.includes(notification.id) ? '...' : '✓' }}
        </button>
      </article>
    </section>

    <button
      v-if="hasMore && !loading && !errorMessage"
      class="load-more-button"
      :disabled="loadingMore"
      @click="loadMore"
    >
      {{ loadingMore ? 'Loading...' : 'Load more notifications' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { supabase } from '../lib/supabase'

type NotificationCategory =
  | 'wallet'
  | 'transfer'
  | 'airtime'
  | 'data'
  | 'bill'
  | 'security'
  | 'system'

type NotificationStatus =
  | 'success'
  | 'pending'
  | 'failed'
  | 'info'
  | 'warning'

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  category: NotificationCategory
  status: NotificationStatus
  reference: string | null
  metadata: Record<string, unknown>
  read_at: string | null
  created_at: string
}

type FilterValue = 'all' | 'unread' | 'read'

const notifications = ref<Notification[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const errorMessage = ref('')
const activeFilter = ref<FilterValue>('all')
const updatingIds = ref<string[]>([])
const currentUserId = ref('')
const pageSize = 20
const hasMore = ref(false)

let channel: ReturnType<typeof supabase.channel> | null = null
let requestVersion = 0

const filters: { label: string; value: FilterValue }[] = [
  { label: 'All', value: 'all' },
  { label: 'Unread', value: 'unread' },
  { label: 'Read', value: 'read' }
]

const unreadCount = computed(() =>
  notifications.value.filter(item => !item.read_at).length
)

const filteredNotifications = computed(() => {
  if (activeFilter.value === 'unread') {
    return notifications.value.filter(item => !item.read_at)
  }

  if (activeFilter.value === 'read') {
    return notifications.value.filter(item => !!item.read_at)
  }

  return notifications.value
})

function categoryIcon(category: NotificationCategory): string {
  const icons: Record<NotificationCategory, string> = {
    wallet: '💳',
    transfer: '↗',
    airtime: '📱',
    data: '🌐',
    bill: '🧾',
    security: '🛡️',
    system: '🔔'
  }

  return icons[category] ?? '🔔'
}

function categoryLabel(category: NotificationCategory): string {
  const labels: Record<NotificationCategory, string> = {
    wallet: 'Wallet',
    transfer: 'Transfer',
    airtime: 'Airtime',
    data: 'Data',
    bill: 'Bills',
    security: 'Security',
    system: 'System'
  }

  return labels[category] ?? 'System'
}

function formatDate(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date)
}

function mergeNotification(incoming: Notification) {
  const index = notifications.value.findIndex(
    item => item.id === incoming.id
  )

  if (index >= 0) {
    notifications.value[index] = incoming
  } else {
    notifications.value.unshift(incoming)
  }

  notifications.value.sort(
    (a, b) =>
      new Date(b.created_at).getTime() -
      new Date(a.created_at).getTime()
  )

  notifications.value = notifications.value.slice(0, 200)
}

async function loadNotifications() {
  const version = ++requestVersion
  loading.value = true
  errorMessage.value = ''

  try {
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error('Please log in again to view your notifications.')
    }

    currentUserId.value = user.id

    const { data, error } = await supabase
      .from('notifications')
      .select(
        'id, user_id, title, message, category, status, reference, metadata, read_at, created_at'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(pageSize + 1)

    if (error) throw error
    if (version !== requestVersion) return

    const rows = (data ?? []) as Notification[]
    hasMore.value = rows.length > pageSize
    notifications.value = rows.slice(0, pageSize)
  } catch (error: unknown) {
    if (version !== requestVersion) return

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Something went wrong while loading notifications.'
  } finally {
    if (version === requestVersion) loading.value = false
  }
}

async function loadMore() {
  if (!hasMore.value || loadingMore.value) return

  loadingMore.value = true

  try {
    const last = notifications.value[notifications.value.length - 1]
    if (!last) {
      hasMore.value = false
      return
    }

    const { data, error } = await supabase
      .from('notifications')
      .select(
        'id, user_id, title, message, category, status, reference, metadata, read_at, created_at'
      )
      .eq('user_id', currentUserId.value)
      .lt('created_at', last.created_at)
      .order('created_at', { ascending: false })
      .limit(pageSize + 1)

    if (error) throw error

    const rows = (data ?? []) as Notification[]
    hasMore.value = rows.length > pageSize

    for (const item of rows.slice(0, pageSize)) {
      if (!notifications.value.some(existing => existing.id === item.id)) {
        notifications.value.push(item)
      }
    }
  } catch (error: unknown) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Could not load more notifications.'
  } finally {
    loadingMore.value = false
  }
}

async function markAsRead(notification: Notification) {
  if (
    notification.read_at ||
    updatingIds.value.includes(notification.id)
  ) {
    return
  }

  updatingIds.value.push(notification.id)

  const readAt = new Date().toISOString()

  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read_at: readAt })
      .eq('id', notification.id)
      .eq('user_id', currentUserId.value)
      .is('read_at', null)
      .select('id, read_at')
      .maybeSingle()

    if (error) throw error

    if (data) {
      const item = notifications.value.find(
        existing => existing.id === notification.id
      )

      if (item) item.read_at = data.read_at
    }
  } catch (error: unknown) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Could not mark this notification as read.'
  } finally {
    updatingIds.value = updatingIds.value.filter(
      id => id !== notification.id
    )
  }
}

async function markAllAsRead() {
  if (unreadCount.value === 0) return

  const unreadIds = notifications.value
    .filter(item => !item.read_at)
    .map(item => item.id)

  const readAt = new Date().toISOString()
  errorMessage.value = ''

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: readAt })
      .eq('user_id', currentUserId.value)
      .is('read_at', null)
      .in('id', unreadIds)

    if (error) throw error

    notifications.value = notifications.value.map(item =>
      unreadIds.includes(item.id)
        ? { ...item, read_at: readAt }
        : item
    )
  } catch (error: unknown) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'Could not mark notifications as read.'
  }
}

function subscribeToNotifications() {
  if (!currentUserId.value) return

  channel = supabase
    .channel(`notifications-${currentUserId.value}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${currentUserId.value}`
      },
      payload => {
        mergeNotification(payload.new as Notification)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${currentUserId.value}`
      },
      payload => {
        mergeNotification(payload.new as Notification)
      }
    )
    .subscribe()
}

onMounted(async () => {
  await loadNotifications()

  if (currentUserId.value) {
    subscribeToNotifications()
  }
})

onUnmounted(() => {
  requestVersion++

  if (channel) {
    void supabase.removeChannel(channel)
    channel = null
  }
})
</script>

<style scoped>
.notifications-page {
  min-height: 100vh;
  padding: 36px;
  background: #f7faf8;
  color: #10271d;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
}

.eyebrow {
  margin: 0 0 9px;
  color: #0a8754;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 1.5px;
}

.page-header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -0.8px;
}

.subtitle {
  margin: 9px 0 0;
  color: #718079;
  font-size: 14px;
  line-height: 1.6;
}

.mark-all-button,
.retry-button,
.load-more-button {
  border: 1px solid #cfe4d8;
  border-radius: 11px;
  padding: 12px 16px;
  background: #fff;
  color: #08784f;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.mark-all-button:hover,
.retry-button:hover,
.load-more-button:hover {
  background: #eafaf2;
}

.mark-all-button:disabled,
.load-more-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 23px;
  margin-bottom: 26px;
  border: 1px solid #d5eee0;
  border-radius: 18px;
  background: linear-gradient(135deg, #e5f9ef, #fff);
}

.summary-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 15px;
  background: #d0f4df;
  font-size: 24px;
}

.summary-label {
  margin: 0 0 5px;
  color: #597166;
  font-size: 13px;
  font-weight: 600;
}

.summary-card h2 {
  margin: 0;
  color: #063b2b;
  font-size: 29px;
  font-weight: 900;
}

.filters {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
  overflow-x: auto;
}

.filters button {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  padding: 10px 17px;
  border: 1px solid #e0e9e4;
  border-radius: 10px;
  background: #fff;
  color: #718079;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.filters button.active {
  border-color: #0a8754;
  background: #063b2b;
  color: #fff;
}

.filters button span {
  min-width: 21px;
  padding: 3px 5px;
  border-radius: 6px;
  background: rgba(14, 169, 106, 0.12);
  text-align: center;
  font-size: 11px;
}

.filters button.active span {
  background: rgba(255, 255, 255, 0.18);
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-card {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 20px;
  border: 1px solid #e4ece7;
  border-radius: 16px;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.notification-card:hover {
  border-color: #c7e4d4;
  box-shadow: 0 8px 24px rgba(6, 59, 43, 0.04);
}

.notification-card.unread {
  border-left: 4px solid #0ea96a;
  background: #fcfffd;
}

.notification-icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: #eafaf2;
  color: #08784f;
  font-size: 20px;
}

.status-pending .notification-icon {
  background: #fff5df;
}

.status-failed .notification-icon {
  background: #fff0f1;
}

.status-warning .notification-icon {
  background: #fff5df;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-heading {
  display: flex;
  align-items: center;
  gap: 9px;
}

.notification-heading h3 {
  margin: 0;
  color: #183529;
  font-size: 15px;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.unread-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #0ea96a;
}

.notification-message {
  margin: 8px 0 12px;
  color: #65776e;
  font-size: 13px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.notification-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  color: #8a9991;
  font-size: 11px;
}

.category-label {
  color: #08784f;
  font-weight: 800;
}

.reference {
  margin: 10px 0 0;
  color: #7b8982;
  font-size: 11px;
  overflow-wrap: anywhere;
}

.read-button {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border: 1px solid #d5e8dd;
  border-radius: 10px;
  background: #fff;
  color: #08784f;
  font-size: 16px;
  font-weight: 900;
  cursor: pointer;
}

.read-button:hover {
  background: #eafaf2;
}

.read-button:disabled {
  opacity: 0.5;
  cursor: wait;
}

.state-card {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  border: 1px solid #e4ece7;
  border-radius: 18px;
  background: #fff;
  text-align: center;
}

.state-card h3 {
  margin: 10px 0 8px;
  color: #183529;
}

.state-card p {
  max-width: 430px;
  color: #718079;
  font-size: 13px;
  line-height: 1.7;
}

.empty-icon {
  font-size: 35px;
}

.error-state h3 {
  color: #be123c;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #d9f0e3;
  border-top-color: #0a8754;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.load-more-button {
  display: block;
  margin: 22px auto 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 700px) {
  .notifications-page {
    padding: 23px 16px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-header h1 {
    font-size: 27px;
  }

  .mark-all-button {
    width: 100%;
  }

  .summary-card {
    padding: 18px;
  }

  .notification-card {
    gap: 11px;
    padding: 15px 12px;
  }

  .notification-icon {
    width: 38px;
    height: 38px;
    border-radius: 11px;
    font-size: 17px;
  }

  .notification-heading h3 {
    font-size: 14px;
  }

  .read-button {
    width: 30px;
    height: 30px;
  }
}
</style>
