<template>
  <div>
    <el-card
      v-for="(collection, index) in collections"
      :key="collection.id"
      :body-style="{ padding: '10px' }"
      :class="{ active: activeId == collection.id }"
      shadow="hover"
      style="cursor:pointer; margin-bottom:6px;"
      @click.native="$emit('click', collection);activeId=collection.id;"
    >
      <div class="collection-card">
        <!-- 序号 -->
        <span style="margin-right:10px;">{{ index + 1 }}</span>
        <!-- 集合名称 -->
        <div style="display:flex; flex-direction:column; flex:1;">
          <span>{{ collection.name }}</span>
          <span style="display:inline-flex; margin-top:5px;">
            <el-tag type="warning" size="mini" style="margin-right:5px;">start: {{ collection.startTime }}</el-tag>
            <el-tag type="danger" size="mini">elapsed: {{ collection.elapsedTime }}</el-tag>
          </span>
        </div>
        <!-- 成功或失败的图标  -->
        <svg-icon v-if="collection.success" icon-class="pass" class="stauts-svg-icon" />
        <svg-icon v-else icon-class="failure" class="stauts-svg-icon" />
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'CollectionCard',
  props: {
    collections: { type: Array, default: () => [] }
  },
  data() {
    return {
      activeId: 0
    }
  }
}
</script>

<style lang="scss" scoped>
.collection-card {
  display: flex;
  flex: 1;
  align-items: center;
  height: 100%;
  width: 100%;
}

.stauts-svg-icon {
  height: 2em !important;
  width: 2em !important;
}

.active {
  background-color: #f0f7ff;
}
</style>

