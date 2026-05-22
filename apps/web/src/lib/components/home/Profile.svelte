<script lang="ts">
	import InfoCard from '$lib/components/ui/InfoCard.svelte'
</script>

<section class="w-full py-16 sm:py-20 md:py-24 bg-white">
	<div class="max-w-5xl mx-auto px-4 sm:px-6 md:px-8">
		<!-- Heading -->
		<div class="flex items-center gap-3 mb-10">
			<div class="w-1 h-6 rounded-full bg-sky-400"></div>
			<h2 class="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h2>
		</div>

		<div class="flex flex-col md:flex-row gap-10 md:gap-16">
			<!-- Bio -->
			<div class="flex-1 flex flex-col gap-5">
				<p class="text-gray-600 leading-relaxed text-sm sm:text-base">
					大学で情報系を学びながら、個人開発を続けています。<br />
					API 設計・DB 設計・セキュリティに興味があり、<br />
					バックエンドからフロントエンドまで幅広く触ります。
				</p>
				<p class="text-gray-600 leading-relaxed text-sm sm:text-base">
					最近は Cloudflare Workers / D1 を使ったサーバーレス構成や、<br />
					SvelteKit によるフルスタック開発に力を入れています。
				</p>
				<a
					href="/profile"
					class="self-start text-sm text-sky-500 hover:text-sky-600 font-medium transition-colors duration-200 mt-1"
				>
					もっと見る →
				</a>
			</div>

			<!-- Info cards -->
			<div class="flex-1 flex flex-col gap-3">
				<InfoCard label="所属" value="福岡工業大学 情報学部" />
				<InfoCard label="興味" value="API 設計・DB 設計・セキュリティ" />
				<InfoCard label="好きな技術" value="Cloudflare Workers / SvelteKit / Hono" />
				<InfoCard label="趣味" value="個人開発・ゲーム" />
			</div>
		</div>
	</div>
</section>
