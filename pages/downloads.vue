<template>
  <div>
    <div class="p-4 max-w-[1400px] m-auto">
      <div v-if="status === 'pending'" class="text-4xl text-center text-red-500 p-5">
        <UIcon name="i-svg-spinners-blocks-wave" />
      </div>
      <div v-else class="flex flex-col gap-4">
        <UInput
          v-model="filter"
          class="mb-4"
          placeholder="Highlight..."
          icon="i-material-symbols-filter-alt"
          :ui="{ icon: { trailing: { pointer: '' } } }"
          autocomplete="off"
        >
          <template #trailing>
            <UButton
              v-show="filter !== ''"
              color="gray"
              variant="link"
              icon="i-heroicons-x-mark-20-solid"
              :padded="false"
              @click="filter = ''"
            />
          </template>
        </UInput>
        <UAccordion v-if="rootFolders.length > 0" :items="rootFolders" multiple>
          <template #tools_data>
            <div v-if="getFolder('tools').value" class="p-4">
              <div class="grid grid-cols-4">
                <div v-for="file of getFolder('tools').value?.files ?? []" :key="file.url" class="py-1">
                  <ULink
                    :to="`${file.url}`"
                    external
                    :download="file.name"
                    class="transition-all hover:text-green-500"
                    :class="{
                      'text-gray-500/20': filter && !file.name.toLowerCase().includes(filter.toLowerCase()),
                      'text-red-500': filter && file.name.toLowerCase().includes(filter.toLowerCase())
                    }"
                  >
                    {{ file.name }}
                  </ULink>
                </div>
              </div>
            </div>
          </template>
          <template #bootloader_data>
            <div v-if="getFolder('bootloader').value" class="p-4">
              <UAccordion color="teal" :items="getChildrenFolder(getFolder('bootloader').value)" variant="outline" size="sm">
                <template #files="{ item }">
                  <div class="grid grid-cols-4">
                    <div v-for="file of item.files" :key="file" class="py-1">
                      <ULink
                        :to="file.url"
                        external
                        :download="file.name"
                        class="transition-all hover:text-red-500"
                        :class="{
                          'text-gray-500/20': filter && !file.name.toLowerCase().includes(filter.toLowerCase()),
                          'text-red-500': filter && file.name.toLowerCase().includes(filter.toLowerCase())
                        }"
                      >
                        {{ file.name }}
                      </ULink>
                    </div>
                  </div>
                </template>
              </UAccordion>
            </div>
          </template>
        </UAccordion>
        <UCard>
          <template #header>
            <div class="flex items-center gap-2 text-lg font-bold">
              <UIcon name="i-material-symbols-menu-book-outline" class="h-6 w-6" />
              Инструкции
            </div>
          </template>
          <div class="flex flex-col gap-2">
            <ULink
              to="https://disk.yandex.com/i/BYI8WHBuXvtj6w"
              target="_blank"
              external
              class="transition-all hover:text-red-500 text-blue-400"
            >
              Инструкция GD80V1
            </ULink>
            <ULink
              to="https://disk.yandex.ru/i/3SbqDBOG0u3nWw"
              target="_blank"
              external
              class="transition-all hover:text-red-500 text-blue-400"
            >
              Инструкция GD80V2 4in1
            </ULink>
            <ULink
              to="https://disk.yandex.ru/i/YLY2co8TweQr6g"
              target="_blank"
              external
              class="transition-all hover:text-red-500 text-blue-400"
            >
              Инструкция GD80V1 4in1
            </ULink>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
const { data, status } = await useLazyFetch('/api/files?filter=bootloader,tools&prereleases');

const filter = ref('');

const links = ref<BlobFolder[]>([]);
const rootFolders = ref<{
  label: string,
  slot: string
}[]>([]);

watchEffect(() => {
    if (status.value !== 'pending' && data.value) {
        links.value = data.value.data;
        rootFolders.value = data.value.data
            .filter(f => f.name === 'bootloader' || f.name === 'tools')
            .map((f) => {
                return {
                    label: f.name?.toUpperCase() ?? 'ERROR',
                    slot: `${f.name}_data`
                };
            });
    }
});

const getFolder = (name: string) => computed(() => {
    return data.value?.data.find(b => b.name === name) ?? null;
});

const getChildrenFolder = (folder?: BlobFolder | null) => {
    return folder?.children
        .map(f => ({
            label: f.name,
            slot: 'files',
            files: f.files.filter(f => f.name.toLowerCase().endsWith('.hex'))
        }))
        .sort((a, b) => b.label.localeCompare(a.label)) ?? [];
};
</script>
