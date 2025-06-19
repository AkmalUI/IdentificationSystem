<template>
  <v-navigation-drawer permanent color="#202020">
    <template v-slot:prepend>
      <v-list-item
        lines="three"
        prepend-avatar="https://randomuser.me/api/portraits/women/51.jpg"
        title="Admin"
      />
    </template>

    <v-divider color="white" />

    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-apps" title="Product" value="Product" to="/product" />
      <v-list-item prepend-icon="mdi-account" title="Profile" value="Profile" to="/profile" />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup>
// no script needed
</script>
