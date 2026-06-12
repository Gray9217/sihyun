import { useEffect, useState } from 'react'
import axios from 'axios'
import { getApiBase, getKakaoLogoutUrl } from './api/authApi.js'
import { clearAuthSession, fetchCommunityPosts, fetchOpinions, getAuthProvider, getCurrentUserId, setAuthSession } from './api/communityApi.js'
import { isPostOwner } from './communityStorage.js'
import { testData, resultTypes, testDetailedResults } from './data/testData.js'
import { calculateResultType, calculateLoveScore } from './data/testScoring.js'

// Layouts & Modals
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import AuthModal from './components/common/AuthModal'

// Pages
import HomePage from './pages/HomePage.jsx'
import AnalyzeChoicePage from './pages/AnalyzeChoicePage.jsx'
import AnalyzePage from './pages/AnalyzePage.jsx'
import ChatAnalyzePage from './pages/ChatAnalyzePage.jsx'
import AnalysisResultPage from './pages/AnalysisResultPage.jsx'
import TestsPage from './pages/TestsPage.jsx'
import TestDetailPage from './pages/TestDetailPage.jsx'
import TestResultPage from './pages/TestResultPage.jsx'
import CommunityPage from './pages/CommunityPage.jsx'
import CommunityPostWrapper from './pages/CommunityPostWrapper.jsx'
import MyAnalysisPage from './pages/MyAnalysisPage.jsx'
import SupportPage from './pages/SupportPage.jsx'

export default function App() {
  const [route, setRoute] = useState('home')
  
  // Auth State
  const [authMode, setAuthMode] = useState('login')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState('')
  const [pendingAnalyzeAfterAuth, setPendingAnalyzeAfterAuth] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [signupUsername, setSignupUsername] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupPasswordConfirm, setSignupPasswordConfirm] = useState('')

  // Test State
  const [selectedTest, setSelectedTest] = useState(null)
  const [answers, setAnswers] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [resultType, setResultType] = useState(null)
  const [testResultDetail, setTestResultDetail] = useState('')
  const [loveScore, setLoveScore] = useState(0)
  
  // Community State
  const [communityDbPosts, setCommunityDbPosts] = useState([])
  const [communityLoading, setCommunityLoading] = useState(false)
  const [questionOpinions, setQuestionOpinions] = useState([])
  const [viewingPost, setViewingPost] = useState(null)
  const [viewingPostId, setViewingPostId] = useState(null)

  // Analysis State
  const [analysisResult, setAnalysisResult] = useState(null)

  const isLoggedIn = Boolean(loggedInUser)

  useEffect(() => {
    const savedUser = localStorage.getItem('username')
    if (savedUser) setLoggedInUser(savedUser)
    getCurrentUserId()
  }, [])

  const completeAuthLogin = ({ username, token, userId, role, provider }) => {
    setLoggedInUser(username)
    setAuthSession({ username, token, userId, role: role || 'user', provider: provider || 'local' })
    setIsAuthModalOpen(false)
    if (route === 'community') loadCommunityFromServer()
    if (pendingAnalyzeAfterAuth) {
      setPendingAnalyzeAfterAuth(false)
      goAnalyze()
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const authError = params.get('auth_error')
    const token = params.get('token')
    const username = params.get('username')
    const userId = params.get('userId')
    const role = params.get('role')
    const provider = params.get('provider')

    if (authError) {
      alert(decodeURIComponent(authError))
      window.history.replaceState({}, '', window.location.pathname)
      return
    }

    if (token && username && userId) {
      completeAuthLogin({ username, token, userId, role, provider: provider || 'kakao' })
      alert('카카오 로그인 성공!')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  // 브라우저 뒤로/앞으로가기를 앱 내부 화면 전환과 연동
  useEffect(() => {
    window.history.replaceState({ route: 'home' }, '')
    const onPop = (e) => {
      setRoute(e.state?.route || 'home')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // 화면 전환 시 브라우저 히스토리에도 기록 (뒤로가기가 사이트 밖으로 나가지 않도록)
  const navigate = (next) => {
    setRoute(next)
    if (window.history.state?.route !== next) {
      window.history.pushState({ route: next }, '')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 네비게이션 함수들
  const goHome = () => navigate('home')
  const goTests = () => navigate('tests')
  const goAnalyze = () => {
    if (!isLoggedIn) return requireLoginForAnalyze()
    navigate('analyze')
  }
  const goAnalyzeReport = () => {
    if (!isLoggedIn) return requireLoginForAnalyze()
    navigate('analyze-report')
  }
  const goAnalyzeChat = () => {
    if (!isLoggedIn) return requireLoginForAnalyze()
    navigate('analyze-chat')
  }
  const goAnalysisResult = () => navigate('analysis-result')
  const goCommunity = () => {
    setViewingPost(null)
    setViewingPostId(null)
    loadCommunityFromServer()
    navigate('community')
  }
  const goMyAnalysis = () => {
    if (!isLoggedIn) return requireLoginForAnalyze()
    navigate('my-analysis')
  }
  const goSupport = () => navigate('support')

  const handleNavClick = (label) => {
    if (label === '테스트') goTests()
    else if (label === '카톡분석') goAnalyze()
    else if (label === '커뮤니티') goCommunity()
    else if (label === 'MY분석') goMyAnalysis()
    else if (label === '썸앤쌈 SOS') goSupport()
  }

  // 인증 함수들
  const requireLoginForAnalyze = (mode = 'login') => { setPendingAnalyzeAfterAuth(true); setAuthMode(mode); setIsAuthModalOpen(true) }
  const requireLoginForCommunity = (mode = 'login') => { setPendingAnalyzeAfterAuth(false); setAuthMode(mode); setIsAuthModalOpen(true) }
  
  const handleLogout = () => {
    const wasKakaoUser = getAuthProvider() === 'kakao'
    clearAuthSession()
    setLoggedInUser('')
    setLoginEmail('')
    setLoginPassword('')
    setPendingAnalyzeAfterAuth(false)
    if (route.startsWith('analyze') || route === 'community' || route === 'my-analysis') goHome()

    // 카카오 로그인 사용자는 브라우저에 남은 카카오 세션도 함께 종료
    if (wasKakaoUser) {
      window.location.href = getKakaoLogoutUrl()
    }
  }

  const openAuthModal = (mode = 'login') => {
    if (mode === 'login' || mode === 'signup') setAuthMode(mode)
    setIsAuthModalOpen(true)
  }

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${getApiBase()}/login`, { email: loginEmail, password: loginPassword })
      alert(res.data.message)
      completeAuthLogin({
        username: res.data.username,
        token: res.data.token,
        userId: res.data.userId,
        role: res.data.role,
        provider: res.data.provider || 'local',
      })
    } catch (error) {
      alert(error.response?.data?.message || '로그인에 실패했습니다.')
    }
  }

  const handleSignup = async () => {
    if (signupPassword.length < 8) return alert('비밀번호는 8자 이상이어야 합니다.')
    if (signupPassword !== signupPasswordConfirm) return alert('비밀번호가 다릅니다.')
    try {
      await axios.post(`${getApiBase()}/signup`, { username: signupUsername, email: signupEmail, password: signupPassword })
      alert('가입완료!\n로그인 후 이용할 수 있어요.')
      if (pendingAnalyzeAfterAuth) setAuthMode('login')
    } catch (error) {
      alert(error.response?.data?.message || '회원가입에 실패했습니다.')
    }
  }

  // 커뮤니티 API 호출
  const loadCommunityFromServer = async () => {
    setCommunityLoading(true)
    try {
      const [posts, opinions] = await Promise.all([fetchCommunityPosts(), fetchOpinions()])
      const userId = getCurrentUserId()
      setCommunityDbPosts(posts.map((p) => ({ ...p, isOwner: isPostOwner(p, { userId, username: loggedInUser }) })))
      setQuestionOpinions(opinions)
    } catch (error) { console.log(error) } finally { setCommunityLoading(false) }
  }

  const openCommunityPost = (post) => {
    if (!post?.id) return
    setViewingPost(post)
    setViewingPostId(post.id)
    navigate('community-post')
  }

  // 테스트 함수들
  const openTestDetail = (test) => {
    setSelectedTest(test)
    setCurrentQuestion(0)
    setAnswers([])
    setResultType(null)
    setTestResultDetail('')
    navigate('test-detail')
  }

  const handleAnswerClick = (option) => {
    const trait = option.trait || '신중형'
    const updatedAnswers = [...answers, trait]
    setAnswers(updatedAnswers)
    const currentQuestions = testData[selectedTest?.title] || []

    if (currentQuestion + 1 >= currentQuestions.length) {
      const type = calculateResultType(updatedAnswers)
      const score = calculateLoveScore(updatedAnswers, selectedTest?.title || '')
      const detail = testDetailedResults[selectedTest?.title]?.[type] || ''

      setResultType(resultTypes[type])
      setTestResultDetail(detail)
      setLoveScore(score)
      navigate('result')
      return
    }
    setCurrentQuestion(currentQuestion + 1)
  }

  // 공통 헤더 변수화 (CommunityPostPage 등으로 넘기기 위함)
  const appHeader = <Header goHome={goHome} loggedInUser={loggedInUser} handleLogout={handleLogout} openAuthModal={openAuthModal} handleNavClick={handleNavClick} />

  return (
    <div className="min-h-screen bg-white text-[#2a2a33]">
      {appHeader}
      
      {route === 'home' && <HomePage goAnalyze={goAnalyze} goTests={goTests} openTestDetail={openTestDetail} openAuthModal={openAuthModal} />}
      {route === 'analyze' && <AnalyzeChoicePage goHome={goHome} goAnalyzeReport={goAnalyzeReport} goAnalyzeChat={goAnalyzeChat} />}
      {route === 'analyze-report' && <AnalyzePage isLoggedIn={isLoggedIn} goHome={goHome} goBack={goAnalyze} requireLoginForAnalyze={requireLoginForAnalyze} goAnalysisResult={goAnalysisResult} setAnalysisResult={setAnalysisResult} />}
      {route === 'analyze-chat' && <ChatAnalyzePage goHome={goHome} goBack={goAnalyze} />}
      {route === 'analysis-result' && <AnalysisResultPage analysisResult={analysisResult} goHome={goHome} goAnalyze={goAnalyzeReport} />}
      {route === 'tests' && <TestsPage openTestDetail={openTestDetail} />}
      {route === 'test-detail' && <TestDetailPage goTests={goTests} selectedTest={selectedTest} currentQuestion={currentQuestion} currentQuestions={testData[selectedTest?.title]} handleAnswerClick={handleAnswerClick} />}
      {route === 'result' && (
        <TestResultPage
          resultType={resultType}
          testTitle={selectedTest?.title}
          testResultDetail={testResultDetail}
          loveScore={loveScore}
          goTests={goTests}
        />
      )}
      {route === 'my-analysis' && <MyAnalysisPage isLoggedIn={isLoggedIn} goHome={goHome} goAnalyze={goAnalyze} requireLoginForAnalyze={requireLoginForAnalyze} />}
      {route === 'support' && <SupportPage goAnalyze={goAnalyze} goTests={goTests} />}
      {route === 'community' && <CommunityPage isLoggedIn={isLoggedIn} loggedInUser={loggedInUser} requireLoginForCommunity={requireLoginForCommunity} communityDbPosts={communityDbPosts} setCommunityDbPosts={setCommunityDbPosts} questionOpinions={questionOpinions} setQuestionOpinions={setQuestionOpinions} openCommunityPost={openCommunityPost} communityLoading={communityLoading} goAnalyze={goAnalyze} />}
      {route === 'community-post' && <CommunityPostWrapper viewingPost={viewingPost} viewingPostId={viewingPostId} communityDbPosts={communityDbPosts} setCommunityDbPosts={setCommunityDbPosts} setViewingPost={setViewingPost} setViewingPostId={setViewingPostId} isLoggedIn={isLoggedIn} loggedInUser={loggedInUser} goCommunity={goCommunity} requireLoginForCommunity={requireLoginForCommunity} header={appHeader} />}

      <Footer />

      {isAuthModalOpen && (
        <AuthModal
          authMode={authMode} setAuthMode={setAuthMode} setIsAuthModalOpen={setIsAuthModalOpen}
          loginEmail={loginEmail} setLoginEmail={setLoginEmail} loginPassword={loginPassword} setLoginPassword={setLoginPassword} handleLogin={handleLogin}
          signupUsername={signupUsername} setSignupUsername={setSignupUsername} signupEmail={signupEmail} setSignupEmail={setSignupEmail}
          signupPassword={signupPassword} setSignupPassword={setSignupPassword} signupPasswordConfirm={signupPasswordConfirm} setSignupPasswordConfirm={setSignupPasswordConfirm}
          handleSignup={handleSignup} primaryBtn="rounded-xl bg-[#171717] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#404040] active:scale-[0.99]"
          authNotice={pendingAnalyzeAfterAuth ? '해당 기능은 회원가입 후 로그인한 회원만 이용할 수 있어요.' : undefined}
        />
      )}
    </div>
  )
}