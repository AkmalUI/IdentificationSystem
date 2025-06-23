<template>
  <div class="page-container">
    <!-- Header -->
    <div class="header">
      <div class="title" style="display: flex; justify-content: space-between; align-items: center">
        <div>Device List</div>
        <div>
          <v-btn color="secondary" class="mr-2" @click="openDialog('add')">Add Device</v-btn>
        </div>
      </div>
    </div>

    <!-- Scrollable Table -->
    <div class="table-container">
      <v-data-table
        :items="devices"
        :headers="headers"
        :sort-by="['UID']"
        class="elevation-1"
        disable-pagination
        dense
      >
        <template v-slot:item.actions="{ item }">
          <div>
            <v-btn color="primary" size="small" @click="openDialog('edit', item)"
              >Edit Device</v-btn
            >
            <v-btn color="error" size="small" @click="deleteDevice(item)">Delete</v-btn>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Footer -->
    <div class="footer">Total devices: {{ devices.length }}</div>

    <!-- Image Preview Dialog -->
    <v-dialog v-model="previewDialog" fullscreen>
      <v-card class="d-flex flex-column fill-height">
        <v-carousel v-model="carouselIndex" height="100vh" hide-delimiter-background show-arrows>
          <v-carousel-item v-for="(card, index) in cards" :key="card.id" :value="index">
            <div style="position: relative; width: 100%; height: 100%">
              <v-img :src="card.imageSrc" cover height="100vh" width="100vw" />
              <!-- Overlay Number -->
              <div
                style="
                  position: absolute;
                  top: 10px;
                  left: 10px;
                  background: rgba(0, 0, 0, 0.7);
                  color: white;
                  border-radius: 50%;
                  width: 50px;
                  height: 50px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  font-size: 20px;
                  z-index: 10;
                "
              >
                {{ card.id }}
              </div>
            </div>
          </v-carousel-item>
        </v-carousel>

        <v-spacer></v-spacer>
        <!-- Push close button down -->

        <v-card-actions class="justify-end">
          <v-btn text color="primary" @click="previewDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Device Dialog -->
    <v-dialog
      v-model="viewDialog"
      :max-width="dialogMode === 'add' ? '400px' : '1200px'"
      max-height="800px"
      persistent
    >
      <v-card class="d-flex flex-column" style="height: 100%">
        <v-card-title>
          <span class="text-h5">
            {{ dialogMode === 'add' ? 'Add Device' : 'Edit Device Info' }}
          </span>
        </v-card-title>

        <!-- Make card-text scrollable -->
        <v-card-text v-if="selectedDevice" class="flex-grow-1 overflow-y-auto">
          <v-container>
            <v-row>
              <!-- Sidebar Form (Left Column) -->
              <v-col :cols="dialogMode === 'add' ? 12 : 4">
                <v-text-field
                  v-model="selectedDevice.UID"
                  label="Device UID"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="selectedDevice.name"
                  label="Device Name"
                  required
                ></v-text-field>
                <v-text-field
                  v-model="selectedDevice.screencount"
                  label="Screen Count"
                  type="number"
                  min="0"
                  :max="8"
                  required
                  @keydown="blockInvalidKeys"
                ></v-text-field>
              </v-col>

              <!-- Cards Grid (Right Column) -->
              <v-col cols="8" v-if="dialogMode === 'edit'">
                <v-row class="d-flex flex-wrap">
                  <v-col v-for="card in cards" :key="card.id" cols="3">
                    <v-card class="ma-2" width="100%" outlined>
                      <div
                        style="
                          position: absolute;
                          top: 6px;
                          left: 6px;
                          background-color: rgba(0, 0, 0, 0.7);
                          color: white;
                          border-radius: 50%;
                          width: 24px;
                          height: 24px;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          font-size: 14px;
                          z-index: 1;
                        "
                      >
                        {{ card.id }}
                      </div>

                      <v-img
                        :src="card.imageSrc"
                        @click="openPreview(card.imageSrc)"
                        @error="handleImageError(card)"
                        height="110"
                        width="100%"
                        cover
                        class="cursor-pointer"
                      ></v-img>

                      <v-card-actions class="justify-center" style="padding: 0; min-height: 0">
                        <v-label></v-label>
                        <v-btn icon @click="deleteimage(card)" color="black" size="x-small">
                          <v-icon>mdi-minus</v-icon>
                        </v-btn>
                        <v-btn icon @click="triggerFileInput(card)" color="black" size="x-small">
                          <input
                            type="file"
                            :ref="'fileInput' + card.id"
                            style="display: none"
                            accept=".jpg,.jpeg,.png"
                            @change="handleFileChange($event, card)"
                          />
                          <v-icon>mdi-plus</v-icon>
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <!-- Fixed footer -->
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn v-if="dialogMode === 'edit'" color="secondary" @click="previewDialog = true"
            >Preview</v-btn
          >
          <v-btn color="primary" @click="saveDevice">Save</v-btn>
          <v-btn color="grey" @click="cancelEdit(cards)">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  name: 'DeviceList',
  components: {
    draggable,
  },
  data() {
    return {
      viewDialog: false,
      previewDialog: false,
      dialogMode: 'add',
      originalDeviceName: '',
      selectedDevice: { index: '', id: '', name: '', screencount: 0 },
      devices: [],
      cards: [],
      deletecard: [],
      cardStateMap: {},
      carouselIndex: 0,
      previewImageSrc: '',
      headers: [
        { title: 'UID', key: 'UID', sortable: false },
        { title: 'Name', key: 'name', sortable: false },
        { title: 'Screen Count', key: 'screencount', sortable: false },
        { title: 'Actions', key: 'actions', sortable: false },
      ],
    }
  },
  mounted() {
    this.fetchDevices()
  },
  watch: {
    'selectedDevice.screencount'(newCount) {
      // Clamp screen count
      if (newCount < 0) newCount = 0
      if (newCount > 8) newCount = 8
      this.selectedDevice.screencount = newCount

      const currentCards = [...this.cards] // shallow clone
      const updatedCards = []

      for (let i = 0; i < newCount; i++) {
        const id = i + 1
        const existingCard = currentCards.find((card) => card.id === id)
        const state = this.cardStateMap[id] || {}

        const exist = state.exist ?? true

        updatedCards.push(
          existingCard ?? {
            id,
            exist,
            imageSrc: exist
              ? `/images/${this.originalDeviceName}/${id}.jpg?${Date.now()}`
              : `/images/default/1.jpg?${Date.now()}`,
          },
        )
      }

      this.cards = updatedCards
    },
  },
  methods: {
    blockInvalidKeys(event) {
      const invalidChars = ['e', 'E', '+', '-', '.']
      if (invalidChars.includes(event.key)) {
        event.preventDefault()
      }
    },
    triggerFileInput(card) {
      const input = this.$refs['fileInput' + card.id]
      if (Array.isArray(input)) {
        input[0].click()
      } else if (input) {
        input.click()
      }
    },
    handleFileChange(event, card) {
      const file = event.target.files[0]
      if (file) {
        this.uploadImage(file, card.id)
        this.deletecard = this.deletecard.filter((item) => item !== card.id)
      }
    },
    handleImageError(card) {
      console.log(`Image failed for card ID ${card.imageSrc}`)
      card.imageSrc = `/images/default/1.jpg?${Date.now()}`
      card.exist = false
    },
    async uploadImage(file, cardId) {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('cardId', cardId)
      formData.append('deviceName', this.selectedDevice.name)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (data.success) {
        const cardIndex = this.cards.findIndex((c) => c.id === cardId)
        if (cardIndex !== -1) {
          this.cards[cardIndex].imageSrc = data.imageUrl
          this.cards[cardIndex].exist = true
        }
      }
    },
    async fetchDevices() {
      try {
        const response = await fetch('/api/getproducts')

        const data = await response.json()
        // map database ItemUID to id

        this.devices = data.map((item) => ({
          index: item.index,
          UID: item.ItemUID,
          name: item.name,
          screencount: item.screen_count,
          actions: true,
        }))
        this.devices.sort((a, b) => a.UID.localeCompare(b.UID))
      } catch (error) {
        console.error('Error fetching devices:', error)
      }
    },
    openDialog(mode, device = null) {
      this.dialogMode = mode
      if (mode === 'edit' && device) {
        this.selectedDevice = { ...device }
        this.originalDeviceName = device.name

        // Save original image paths
        this.cards = Array.from({ length: device.screencount }, (_, index) => {
          const id = index + 1
          const imagePath = `/images/${device.name}/${id}.jpg?${Date.now()}`
          return {
            id,
            exist: true,
            imageSrc: imagePath,
            originalSrc: imagePath, // Save original to revert if cancelled
          }
        })
      } else {
        this.selectedDevice = { index: '', name: '', id: '', screencount: '' }
      }
      this.viewDialog = true
    },
    async deleteDevice(device) {
      try {
        console.log(device.UID) // correct
        const response = await fetch(
          `/api/deleteproducts/${device.UID}?name=${encodeURIComponent(device.name)}`,
          {
            method: 'DELETE',
          },
        )

        if (!response.ok) {
          throw new Error('Failed to delete product')
        }

        // Remove from local list after successful delete
        this.devices = this.devices.filter((d) => d.UID !== device.UID)
      } catch (error) {
        console.error('Error deleting device:', error)
      }
    },
    async saveDevice() {
      const isFilled =
        this.selectedDevice.name && this.selectedDevice.UID && this.selectedDevice.screencount

      if (!isFilled) {
        alert('Please fill all fields')
        return
      }

      try {
        if (this.dialogMode === 'add') {
          const response = await fetch('/api/addproducts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              index: this.selectedDevice.index,
              ItemUID: this.selectedDevice.UID,
              name: this.selectedDevice.name,
              screencount: this.selectedDevice.screencount,
            }),
          })

          if (!response.ok) throw new Error('Failed to add product')

          const data = await response.json()
          this.devices.push({
            index: data.index,
            UID: data.ItemUID,
            name: data.name,
            screencount: data.screen_count,
          })
        } else {
          // For edit mode, update product data
          if (this.deletecard.length > 0) {
            const imagedelete = await fetch('/api/imagedelete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageid: this.deletecard,
                device: this.selectedDevice.name,
              }),
            })

            if (!imagedelete.ok) throw new Error('Failed to save image on imagedelete')
          }
          const imageResponse = await fetch('/api/save-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              oldName: this.originalDeviceName,
              name: this.selectedDevice.name,
              screen_count: this.selectedDevice.screencount,
            }),
          })

          if (!imageResponse.ok) throw new Error('Failed to save image')

          const response = await fetch('/api/updateproducts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              index: this.selectedDevice.index,
              ItemUID: this.selectedDevice.UID,
              name: this.selectedDevice.name,
              screencount: this.selectedDevice.screencount,
            }),
          })

          if (!response.ok) throw new Error('Failed to update product')
          this.originalDeviceName = this.selectedDevice.name

          await this.fetchDevices()
        }

        // Reset form and state
        this.selectedDevice = { index: '', id: '', name: '', screencount: 0 }
        this.viewDialog = false
        this.deletecard = []
      } catch (error) {
        console.error('Error saving device:', error)
      }
    },
    async cancelEdit(cards) {
      this.viewDialog = false

      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Delete all uploaded images on server
      await fetch('/api/delete-temp', { method: 'POST' })

      // Revert each card’s image to its originalSrc
      cards.forEach((card) => {
        card.imageSrc = card.originalSrc
        card.exist = true

        this.cardStateMap[card.id] = {
          ...(this.cardStateMap[card.id] || {}),
          exist: true,
        }
      })

      this.deletecard = []
    },
    async deleteimage(card) {
      if (!this.deletecard.includes(card.id)) {
        this.deletecard.push(card.id)
      }
      card.imageSrc = `/images/default/1.jpg?${Date.now()}`
    },
    openPreview(src) {
      const index = this.cards.findIndex((card) => card.imageSrc === src)
      this.carouselIndex = index !== -1 ? index : 0
      this.previewDialog = true
    },
  },
}
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.header {
  flex: 0 0 auto;
  padding: 16px;
  background-color: #fff;
  border-bottom: 1px solid #ddd;
  z-index: 1;
}

.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-container {
  flex: 1 1 auto;
  overflow: auto;
  padding: 16px;
  background-color: #f9f9f9;
}

.footer {
  flex: 0 0 auto;
  padding: 8px 16px;
  background-color: #fff;
  border-top: 1px solid #ddd;
}
.ghost {
  opacity: 1;
}
.chosen {
  transform: scale(1);
}
</style>
