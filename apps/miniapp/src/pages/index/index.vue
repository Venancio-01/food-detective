<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5" type="home">
{
  style: {
    navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
}
</route>
<template>
  <view
    class="px-4 pt-2 overflow-hidden bg-white"
    :style="{ marginTop: safeAreaInsets?.top + 'px' }"
  >
    <wd-button @click="handleUploadImage" class="my-6">拍照并上传</wd-button>
  </view>
</template>

<script lang="ts" setup>
import PLATFORM from '@/utils/platform'
import useUpload from '@/hooks/useUpload'
import useRequest from '@/hooks/useRequest'
import { testAPI } from '@/service/index/test'

console.log('🚀 - PLATFORM:', PLATFORM)

defineOptions({
  name: 'Home',
})

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

const handleUploadImage = async () => {
  // const { loading, error, data, run } = useRequest(testAPI)
  // await run()
  // console.log('🚀 - handleUploadImage - data:', data)

  const { loading, error, data, run } = useUpload(null, '/image/analyze-openai')
  await run()

  console.log('🚀 - handleUploadImage - data:', data)
  return
}
</script>

<style>
.main-title-color {
  color: #d14328;
}
</style>
