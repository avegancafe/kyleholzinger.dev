<script setup lang="ts">
import { formatDate } from '../utils/format-date';

const props = defineProps<{
  frontmatter: {
    title?: string;
    subtitle?: string;
    heading?: boolean;
    date?: string;
    duration?: string;
  };
}>();

const route = useRoute();
const isBlogPost = computed(() => props.frontmatter.date);
const heading = computed(
	() => props.frontmatter.heading ?? props.frontmatter.title,
);
const article = $ref<HTMLElement>(); // eslint-disable-line no-undef

const { scrollMarginTop } = useCssModule();

onMounted(() => {
	const { innerHeight: windowHeight } = window;
	const pageHeight = document.body.offsetHeight;

	// If page is shorter than double the screen size, disable
	if (pageHeight < windowHeight * 2) {
		return;
	}

	const lastPage = pageHeight - windowHeight;

	// Add scroll margin to anchors on last page
	article.querySelectorAll('[id]').forEach((anchor) => {
		if ((anchor as HTMLElement).offsetTop > lastPage) {
			anchor.classList.add(scrollMarginTop);
		}
	});
});

useHead({
	meta: [
		{
			property: 'og:type',
			content: 'article',
		},
	],
});

if (props.frontmatter.title) {
	useHead({
		title: `${props.frontmatter.title} | UNTITLED`,
		meta: [
			{
				property: 'og:title',
				content: props.frontmatter.title,
			},
		],
	});
}

if (props.frontmatter.subtitle) {
	useHead({
		meta: [
			{
				property: 'description',
				content: props.frontmatter.subtitle,
			},
			{
				property: 'og:description',
				content: props.frontmatter.subtitle,
			},
		],
	});
}
</script>

<template>
	<div
		v-if="heading"
		class="prose m-auto mb-8"
	>
		<h1>
			{{ heading }}
		</h1>
		<p
			v-if="isBlogPost"
			class="opacity-80 text-lg"
		>
			{{ formatDate(props.frontmatter.date!) }}
			<span v-if="props.frontmatter.duration">
				· {{ props.frontmatter.duration }}
			</span>
		</p>
		<p
			v-if="props.frontmatter.subtitle"
			class="opacity-70 italic text-lg"
		>
			{{ props.frontmatter.subtitle }}
		</p>
	</div>
	<article
		ref="article"
		class="prose m-auto"
	>
		<slot />
	</article>

	<div
		v-if="isBlogPost"
		class="prose m-auto m-t-20"
	>
		<hr>

		<div class="flex gap-8 items-center justify-center">
			<router-link to="/">
				<img
					src="/profile-square.png"
					class="min-w-30 h-30 rounded-50"
				>
			</router-link>
			<div>
				<div class="font-medium">
					These are all my personal opinions, they are probably inaccurate. I
					apologize in advance, or your welcome, depending on how you enjoyed
					the post.
				</div>
				<div class="m-t-2">
					— Kyle Holzinger
				</div>
				<div class="m-t-1 opacity-70">
					Software engineer & wannabe rennaisance man.<br>Living in NYC. Working at Relay Payments.
				</div>
			</div>
		</div>

		<div class="flex justify-center">
			<Button
				href="https://twitter.com/kyleholzinger"
				size="small"
				class="m-t-8"
			>
				<icon-mdi-twitter class="m-r-1" /> Follow @kyleholzinger
			</Button>
		</div>

		<div class="m-t-15 flex justify-between text-xs">
			<div>
				<div class="text-sm font-bold">
					Have a question for me?
				</div>
				Reach out on
				<ExternalLink href="https://twitter.com/kyleholzinger">
					Twitter
				</ExternalLink>
				or
				<ExternalLink
					href="https://github.com/avegancafe/kyleholzinger.dev/discussions"
				>
					GitHub
				</ExternalLink>
			</div>

			<div>
				<div class="text-sm font-bold">
					Want to propose an edit?
				</div>
				<ExternalLink
					:href="`https://github.com/avegancafe/kyleholzinger.dev/blob/master${route.meta.filePath}`"
				>
					Open a pull request
				</ExternalLink>
			</div>
		</div>
	</div>
</template>

<style module>
.scroll-margin-top {
  scroll-margin-top: 60px;
}
</style>
