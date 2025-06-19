<template>
  <v-container class="pa-4">
    <v-card class="mx-auto" max-width="400">
      <v-card-title>
        <v-avatar size="64" class="mr-3">
          <v-img src="https://randomuser.me/api/portraits/women/51.jpg" />
        </v-avatar>
        <div>
          <div class="text-h6">Admin</div>
          <div class="text-subtitle-2 text-grey">Admin@Account.com</div>
        </div>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-list dense>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Phone</v-list-item-title>
              <v-list-item-subtitle>+1 234 567 890</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Address</v-list-item-title>
              <v-list-item-subtitle>123 Main Street, Cityville</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>

          <v-list-item>
            <v-list-item-content>
              <v-list-item-title>Member Since</v-list-item-title>
              <v-list-item-subtitle>January 2020</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'Profile',
}
</script>

<style scoped></style>
