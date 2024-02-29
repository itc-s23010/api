import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  // 入力値とAPIレスポンスを保持する状態変数
  const [origin, setOrigin] = useState(''); // 出発地
  const [destination, setDestination] = useState(''); // 目的地
  const [distance, setDistance] = useState(''); // 距離
  const [duration, setDuration] = useState(''); // 時間
  const [hotels, setHotels] = useState([]); // 周辺のホテル

  // フォームの送信を処理する関数
  const handleSubmit = async (e) => {
    e.preventDefault(); // デフォルトのフォーム送信動作を防止

    try {
      // Google Maps APIを使用して距離と時間を取得
      const directionsResponse = await axios.get(`https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`);
      const { distance, duration } = directionsResponse.data.routes[0].legs[0]; // APIレスポンスから距離と時間を抽出
      setDistance(distance.text); // 距離を更新
      setDuration(duration.text); // 時間を更新

      // Google Maps APIを使用して目的地の緯度経度を取得
      const geocodeResponse = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${destination}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`);
      const lat = geocodeResponse.data.results[0].geometry.location.lat; // 目的地の緯度
      const lng = geocodeResponse.data.results[0].geometry.location.lng; // 目的地の経度

      // 楽天トラベルAPIを使用して周辺のホテルを検索
      const hotelsResponse = await axios.get(`https://app.rakuten.co.jp/services/api/Travel/SimpleHotelSearch/20170426?format=json&latitude=${lat}&longitude=${lng}&searchRadius=3&applicationId=${process.env.NEXT_PUBLIC_RAKUTEN_API_KEY}`);
      setHotels(hotelsResponse.data.hotels); // ホテルデータを更新
    } catch (error) {
      console.error(error); // APIリクエスト中に発生したエラーをログに出力
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* 出発地と目的地の入力フォーム */}
        <label>
          出発地:
          <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} />
        </label>
        <br />
        <label>
          目的地:
          <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} />
        </label>
        <br />
        <button type="submit">検索</button> {/* フォームを送信するボタン */}
      </form>

      {/* 距離と時間を表示 */}
      {distance && <p>距離: {distance}</p>}
      {duration && <p>時間: {duration}</p>}

      {/* 周辺のホテルリスト */}
      <h2>周辺の宿泊施設</h2>
      <ul>
        {hotels.map((hotel, index) => (
          <li key={index}>{hotel.hotel[0].hotelBasicInfo.hotelName}</li> // ホテル名を表示
        ))}
      </ul>
    </div>
  );
}

