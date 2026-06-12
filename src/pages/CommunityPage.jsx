import { useState } from "react";
import communityContent from "../data/communityContent.json";
import {
    enrichPost,
    isPostOwner,
    matchesCommunitySearch,
    matchesCommunityTag,
} from "../communityStorage.js";
import {
    createCommunityPost,
    createOpinion,
    togglePostLike,
    getCurrentUserId,
} from "../api/communityApi.js";
import {
    CommunityOpinionModal,
    CommunityWriteModal,
} from "../components/CommunityModals.jsx";
import {
    communityCategories,
    communityTagMap,
    communityWriteCategories,
    COMMUNITY_PAGE_SIZE,
    primaryBtn,
    outlineBtn,
} from "../data/constants";

export default function CommunityPage({
    isLoggedIn,
    loggedInUser,
    requireLoginForCommunity,
    communityDbPosts,
    setCommunityDbPosts,
    questionOpinions,
    setQuestionOpinions,
    openCommunityPost,
    communityLoading,
    goAnalyze,
}) {
    const [communityCategory, setCommunityCategory] = useState("전체");
    const [communitySearch, setCommunitySearch] = useState("");
    const [activeTag, setActiveTag] = useState(null);
    const [communityPage, setCommunityPage] = useState(1);
    const [isWritePostModalOpen, setIsWritePostModalOpen] = useState(false);
    const [isOpinionModalOpen, setIsOpinionModalOpen] = useState(false);
    const [isDiscussionModalOpen, setIsDiscussionModalOpen] = useState(false);

    // 파생 데이터 연산
    const filePostRows = Array.isArray(communityContent.posts)
        ? communityContent.posts
        : [];
    const filePosts = filePostRows.map((p, i) => {
        const author = p.author || "익명";
        return enrichPost({
            ...p,
            id: p.id || `json-${i}`,
            author,
            initial: p.initial || author.slice(0, 1),
            readOnly: true,
            source: "json",
            liked: false,
        });
    });

    const mergedPosts = [
        ...communityDbPosts.map((p) => enrichPost(p)),
        ...filePosts,
    ];

    const filteredPosts = mergedPosts.filter((p) => {
        if (communityCategory !== "전체" && p.category !== communityCategory)
            return false;
        if (activeTag)
            return matchesCommunityTag(p, activeTag, communityTagMap);
        return matchesCommunitySearch(p, communitySearch);
    });

    const clearFilters = () => {
        setActiveTag(null);
        setCommunitySearch("");
        setCommunityCategory("전체");
        setCommunityPage(1);
    };

    const handleTagClick = (tag) => {
        const config = communityTagMap[tag];
        setActiveTag(tag);
        setCommunitySearch("");
        setCommunityCategory(config?.category || "전체");
        setCommunityPage(1);
    };

    const totalPages = Math.max(
        1,
        Math.ceil(filteredPosts.length / COMMUNITY_PAGE_SIZE)
    );
    const safePage = Math.min(communityPage, totalPages);
    const pageSlice = filteredPosts.slice(
        (safePage - 1) * COMMUNITY_PAGE_SIZE,
        safePage * COMMUNITY_PAGE_SIZE
    );

    const hotDisplay = [...mergedPosts]
        .filter((p) => p.title)
        .sort((a, b) => {
            const scoreA = (a.likes || 0) * 2 + (a.comments || 0);
            const scoreB = (b.likes || 0) * 2 + (b.comments || 0);
            return scoreB - scoreA;
        })
        .slice(0, 5)
        .map((p, i) => ({
            rank: i + 1,
            id: p.id,
            title: p.title,
            likes: p.likes || 0,
            comments: p.comments || 0,
            post: p,
        }));

    const todayQ = communityContent.todayQuestion || {};
    const todayQuestionText =
        typeof todayQ.text === "string" && todayQ.text.trim()
            ? todayQ.text
            : "오늘의 질문을 적어주세요.";
    const participantTotal =
        (Number(todayQ.baseParticipantCount) || 0) + questionOpinions.length;
    const tagList = Array.isArray(communityContent.tags)
        ? communityContent.tags
        : [];

    const handleSaveUserPost = async ({
        emoji,
        title,
        category,
        body,
        nickname,
    }) => {
        if (!isLoggedIn) return requireLoginForCommunity();
        try {
            const post = await createCommunityPost({
                emoji,
                title,
                category,
                body,
                nickname,
            });
            const userId = getCurrentUserId();
            setCommunityDbPosts((prev) => [
                {
                    ...post,
                    isOwner: isPostOwner(post, {
                        userId,
                        username: loggedInUser,
                    }),
                },
                ...prev,
            ]);
            alert("글이 등록됐어요.");
            setIsWritePostModalOpen(false);
        } catch (error) {
            alert("글 등록에 실패했습니다.");
        }
    };

    // [수정됨] handleSaveOpinion과 handleSaveDiscussion을 별도 함수로 분리했습니다.
    const handleSaveOpinion = async ({ text, nickname }) => {
        if (!isLoggedIn) return requireLoginForCommunity();
        try {
            const { opinion } = await createOpinion({ text, nickname });
            setQuestionOpinions((prev) => [opinion, ...prev]);
            alert("의견이 등록됐어요.");
            setIsOpinionModalOpen(false);
        } catch (error) {
            alert("의견 등록에 실패했습니다.");
        }
    };

    const handleSaveDiscussion = async ({ text, nickname }) => {
        if (!isLoggedIn) return requireLoginForCommunity();
        try {
            await createOpinion({
                text,
                nickname,
            });
            alert("토론 의견이 등록됐어요.");
            setIsDiscussionModalOpen(false);
        } catch (error) {
            alert("토론 의견 등록에 실패했습니다.");
        }
    };

    const handleToggleLike = async (post, e) => {
        e?.stopPropagation();
        if (!isLoggedIn) return requireLoginForCommunity();
        if (post.readOnly) return;
        try {
            const data = await togglePostLike(post.id);
            setCommunityDbPosts((prev) =>
                prev.map((p) =>
                    p.id === post.id
                        ? { ...p, likes: data.likes, liked: data.liked }
                        : p
                )
            );
        } catch (error) {
            alert("좋아요 처리에 실패했습니다.");
        }
    };

    return (
        <main className='mx-auto max-w-[1200px] px-4 pb-16 pt-8 sm:px-6 sm:pt-10'>
            <div className='flex flex-col gap-6 border-b border-neutral-200/80 pb-8 lg:flex-row lg:items-end lg:justify-between'>
                <div>
                    <h1 className='font-display text-3xl tracking-tight sm:text-4xl'>
                        커뮤니티
                    </h1>
                    <p className='mt-2 text-sm text-neutral-500'></p>
                </div>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end'>
                    <input
                        type='search'
                        value={communitySearch}
                        onChange={(e) => {
                            setCommunitySearch(e.target.value);
                            setActiveTag(null);
                            setCommunityPage(1);
                        }}
                        placeholder='검색'
                        className='w-full rounded-full border border-neutral-200 bg-white py-3 px-4 text-sm'
                    />
                    <button
                        type='button'
                        onClick={() =>
                            isLoggedIn
                                ? setIsWritePostModalOpen(true)
                                : requireLoginForCommunity()
                        }
                        className='shrink-0 rounded-full bg-[#171717] px-6 py-3 text-sm font-semibold text-white'
                    >
                        글쓰기
                    </button>
                </div>
            </div>

            <div className='mt-10 grid gap-10 lg:grid-cols-[1fr_300px]'>
                <div className='min-w-0'>
                    {/* 카테고리 분류 탭 */}
                    <div className='mb-6 flex flex-wrap gap-2'>
                        {communityCategories.map((category) => (
                            <button
                                key={category}
                                type='button'
                                onClick={() => {
                                    setCommunityCategory(category);
                                    setActiveTag(null);
                                    setCommunityPage(1);
                                }}
                                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                                    communityCategory === category
                                        ? "border-[#171717] bg-[#171717] text-white"
                                        : "border-neutral-200 bg-white text-[#4a4550] hover:border-neutral-400"
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    {/* 커뮤니티 리스트 UI */}
                    {(activeTag ||
                        communitySearch ||
                        communityCategory !== "전체") && (
                        <div className='mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm'>
                            <span className='text-neutral-600'>
                                {activeTag
                                    ? `${activeTag} 태그 필터`
                                    : communitySearch
                                    ? `"${communitySearch}" 검색 결과`
                                    : `${communityCategory} 카테고리`}
                                {" · "}
                                <span className='font-semibold text-[#171717]'>
                                    {filteredPosts.length}건
                                </span>
                            </span>
                            <button
                                type='button'
                                onClick={clearFilters}
                                className='ml-auto rounded-full border border-neutral-300 px-3 py-1 text-xs font-semibold text-neutral-600 hover:bg-white'
                            >
                                필터 해제
                            </button>
                        </div>
                    )}
                    <div className='overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-sm'>
                        {!communityLoading && pageSlice.length === 0 && (
                            <p className='p-8 text-center text-sm text-neutral-500'>
                                {activeTag || communitySearch
                                    ? "조건에 맞는 글이 없어요."
                                    : "해당 카테고리에 글이 없어요."}
                            </p>
                        )}
                        {communityLoading && (
                            <p className='p-4 text-center'>로딩 중...</p>
                        )}
                        <ul>
                            {pageSlice.map((post) => (
                                <li
                                    key={post.id}
                                    onClick={() => openCommunityPost(post)}
                                    className='cursor-pointer border-b border-neutral-100 p-5 hover:bg-neutral-50/80'
                                >
                                    {post.category && (
                                        <span className='mb-2 inline-flex rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600'>
                                            {post.category}
                                        </span>
                                    )}
                                    <h2 className='text-base font-semibold'>
                                        {post.emoji} {post.title}
                                    </h2>
                                    <p className='mt-2 text-sm text-neutral-500'>
                                        {post.excerpt}
                                    </p>
                                    <div className='mt-4 flex items-center gap-4 text-xs'>
                                        <button
                                            onClick={(e) =>
                                                handleToggleLike(post, e)
                                            }
                                            className='text-neutral-500'
                                        >
                                            ♡ {post.likes ?? 0}
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <aside className='space-y-6'>
                    <section className='rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm'>
                        <div className='flex items-center justify-between gap-2'>
                            <h3 className='font-bold text-[#171717]'>
                                실시간 인기 글
                            </h3>

                            <span className='rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-600'>
                                LIVE
                            </span>
                        </div>
                        <p className='mt-1 text-xs text-neutral-500'></p>
                        {hotDisplay.length === 0 ? (
                            <p className='mt-4 text-sm text-neutral-500'>
                                아직 인기 글이 없어요.
                            </p>
                        ) : (
                            <ol className='mt-4 space-y-1'>
                                {hotDisplay.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            type='button'
                                            onClick={() =>
                                                openCommunityPost(item.post)
                                            }
                                            className='flex w-full items-start gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-neutral-50'
                                        >
                                            <span
                                                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                                                    item.rank === 1
                                                        ? "bg-[#171717] text-white"
                                                        : item.rank === 2
                                                        ? "bg-neutral-800 text-white"
                                                        : item.rank === 3
                                                        ? "bg-neutral-600 text-white"
                                                        : "bg-neutral-100 text-neutral-600"
                                                }`}
                                            >
                                                {item.rank}
                                            </span>
                                            <span className='min-w-0 flex-1'>
                                                <span className='line-clamp-2 text-sm font-semibold leading-snug text-[#171717]'>
                                                    {item.title}
                                                </span>
                                                <span className='mt-1 flex items-center gap-2 text-xs text-neutral-500'>
                                                    <span>♡ {item.likes}</span>
                                                    {item.comments > 0 && (
                                                        <span>
                                                            💬 {item.comments}
                                                        </span>
                                                    )}
                                                </span>
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </section>
                    <section className='rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm'>
                        <div className='flex items-center justify-between'>
                            <h3 className='font-bold text-[#171717]'>
                                토론 주제
                            </h3>
                            <span className='text-xs font-bold text-orange-500'>
                                HOT
                            </span>
                        </div>

                        <h4 className='mt-3 text-sm font-semibold text-[#171717]'>
                            🔥 깻잎논쟁, 어디까지 괜찮다고 생각하시나요?
                        </h4>

                        <p className='mt-2 text-xs leading-relaxed text-neutral-500'>
                            애인의 친구가 깻잎을 떼지 못하고 있을 때 직접
                            떼어주는 것은 괜찮다 vs 안 된다
                        </p>
                        <button
                            type='button'
                            onClick={() =>
                                isLoggedIn
                                    ? setIsDiscussionModalOpen(true)
                                    : requireLoginForCommunity()
                            }
                            className='mt-4 w-full rounded-full border border-neutral-200 py-2 text-xs font-semibold transition hover:bg-neutral-50'
                        >
                            의견 남기기
                        </button>
                    </section>
                    <section className='rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm'>
                        <h3 className='font-bold text-[#171717]'>오늘의 질문</h3>

                        <p className='mt-2 text-sm leading-relaxed text-neutral-600'>
                            {todayQuestionText}
                        </p>
                        {participantTotal > 0 && (
                            <p className='mt-2 text-xs text-neutral-500'>
                                {participantTotal.toLocaleString()}명 참여
                            </p>
                        )}
                        <button
                            type='button'
                            onClick={() =>
                                isLoggedIn
                                    ? setIsOpinionModalOpen(true)
                                    : requireLoginForCommunity()
                            }
                            className='mt-4 w-full rounded-full border border-neutral-200 py-2.5 text-xs font-semibold transition hover:border-[#171717] hover:bg-neutral-50'
                        >
                            의견 남기기
                        </button>
                    </section>
                    {tagList.length > 0 && (
                        <section className='rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-sm'>
                            <h3 className='font-bold text-[#171717]'>인기 태그</h3>
                            <div className='mt-3 flex flex-wrap gap-2'>
                                {tagList.map((tag) => (
                                    <button
                                        key={tag}
                                        type='button'
                                        onClick={() => handleTagClick(tag)}
                                        className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                            activeTag === tag
                                                ? "bg-[#171717] text-white"
                                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}
                </aside>
            </div>

            <CommunityWriteModal
                open={isWritePostModalOpen}
                onClose={() => setIsWritePostModalOpen(false)}
                onSubmit={handleSaveUserPost}
                primaryBtnClass={primaryBtn}
                categories={communityWriteCategories}
                defaultAuthor={loggedInUser || ""}
            />
            <CommunityOpinionModal
                open={isOpinionModalOpen}
                onClose={() => setIsOpinionModalOpen(false)}
                onSubmit={handleSaveOpinion}
                primaryBtnClass={primaryBtn}
                outlineBtnClass={outlineBtn}
            />
            <CommunityOpinionModal
                open={isDiscussionModalOpen}
                onClose={() => setIsDiscussionModalOpen(false)}
                onSubmit={handleSaveDiscussion}
                primaryBtnClass={primaryBtn}
                outlineBtnClass={outlineBtn}
            />
        </main>
    );
}