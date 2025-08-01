import { useState, useEffect } from 'react';
import {  X, Copy, Clock, Users, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import socket from "../Socket";
const MultiplayerModal = ({ isOpen, onClose, userId ,image,categoryId,numberOfQuestions,difficulty,quizId="",username,profilePicture}) => {
  const [roomId, setRoomId] = useState('');
  const [isWaiting, setIsWaiting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);
  const [linkCopied, setLinkCopied] = useState(false);
const navigate=useNavigate()
  // Generate random room ID
  const generateRoomId = () => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  // Initialize room ID when modal opens
 useEffect(() => {
  if (isOpen && userId) {
    socket.emit("create-room", {
      categoryId: categoryId,
      difficulty: difficulty,
      userId,
      image: image,
      numberOfQuestions,
      quizId,
      username,
      profilePicture
    });
    
  }
}, [isOpen, userId]);

// created the room
useEffect(() => {
  const handleRoomCreated = ({ roomId }) => {
    setRoomId(roomId);
    console.log("room created with id :",roomId)
  };

  socket.on("room-created", handleRoomCreated);

  return () => {
    socket.off("room-created", handleRoomCreated);
  };
}, []);
//listinging for tart game 
useEffect(() => {
  const handleStartGame = ({ quizData, players, scores }) => {
    console.log("Received full game start data", { quizData, players, scores ,userId});
 console.log("Navigating with roomId:", roomId);
    navigate("/runningMultiplayerQuiz", {
      state: { quizData,players, scores,userId,roomId }
    });

    handleClose();
  };

  socket.on("start-game", handleStartGame);

  return () => {
    socket.off("start-game", handleStartGame);
  };
}, [navigate,roomId]);

  // Timer countdown
  useEffect(() => {
    let timer;
    if (isWaiting && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer expired, generate new room ID
      setRoomId(generateRoomId());
      setTimeLeft(120);
    }
    return () => clearInterval(timer);
  }, [isWaiting, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = async () => {
    const link = `${import.meta.env.VITE_APP_FRONTEND_URL}/joinRoom/${roomId}`;
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleShare = (platform) => {
    const link = `${import.meta.env.VITE_APP_FRONTEND_URL}/joinRoom/${roomId}`;
    const message = `Join my quiz room! Room ID: ${roomId}`;
    
    const shareUrls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message + ' ' + link)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(message)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(link)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleDone = () => {
    setIsWaiting(true);
  };

  const handleClose = () => {
    setIsWaiting(false);
    setTimeLeft(120);
    setRoomId('');
    setLinkCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-auto relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-purple-700 mb-2">
            🤝 Multiplayer Quiz
          </h2>
          <p className="text-gray-600">
            {isWaiting ? 'Waiting for players...' : 'Invite friends to join!'}
          </p>
        </div>

        {/* Content */}
        {!userId ? (
          // Not logged in
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Login Required
            </h3>
            <p className="text-gray-600 mb-6">
              Please login or sign up to use multiplayer features
            </p>
            <div className="flex gap-3">
              <button onClick={()=>navigate('/login')} className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                Login
              </button>
              <button onClick={()=>navigate('/signup')} className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors">
                Sign Up
              </button>
            </div>
          </div>
        ) : isWaiting ? (
          // Waiting state
          <div className="text-center py-8">
            <div className="relative mb-6">
              <div className="w-16 h-16 mx-auto border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <Users className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-purple-600" size={24} />
            </div>
            
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Waiting for other players to join...
            </h3>
            
            <div className="flex items-center justify-center gap-2 text-purple-600 mb-4">
              <Clock size={20} />
              <span className="text-xl font-mono font-bold">
                {formatTime(timeLeft)}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm">
              Room ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{roomId}</span>
            </p>
          </div>
        ) : (
          // Room creation state
          <div>
            {/* Room ID Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${import.meta.env.VITE_APP_FRONTEND_URL}/joinRoom/${roomId}`}
                  readOnly
                  className="flex-1 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                    linkCopied 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  }`}
                >
                  <Copy size={16} />
                  {linkCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Social Media Share */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Share with friends
              </label>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="p-3 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                  title="Share on WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </button>
                
                <button
                  onClick={() => handleShare('telegram')}
                  className="p-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                  title="Share on Telegram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </button>
                
                <button
                  onClick={() => handleShare('twitter')}
                  className="p-3 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200 transition-colors"
                  title="Share on Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </button>
                
                <button
                  onClick={() => handleShare('facebook')}
                  className="p-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  title="Share on Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                
                <button
                  onClick={() => handleShare('linkedin')}
                  className="p-3 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                  title="Share on LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Done Button */}
            <button
              onClick={handleDone}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Share2 size={20} />
              Done - Start Waiting
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiplayerModal;