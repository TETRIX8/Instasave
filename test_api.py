#!/usr/bin/env python3
"""
Тестовый скрипт для проверки API Instagram Downloader
"""

import requests
import json

def test_api():
    # URL для тестирования
    test_url = "https://www.instagram.com/p/example"
    
    # Данные для отправки
    data = {
        "url": test_url
    }
    
    try:
        # Отправляем POST запрос к API
        response = requests.post(
            "http://localhost:5000/api/download",
            json=data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"Success: {result.get('success')}")
            print(f"Download URL: {result.get('downloadUrl')}")
        else:
            print("Error occurred")
            
    except requests.exceptions.ConnectionError:
        print("Ошибка подключения. Убедитесь, что сервер запущен на localhost:5000")
    except Exception as e:
        print(f"Ошибка: {e}")

def test_health():
    try:
        response = requests.get("http://localhost:5000/api/health")
        print(f"Health Check Status: {response.status_code}")
        print(f"Health Response: {response.text}")
    except Exception as e:
        print(f"Health check error: {e}")

if __name__ == "__main__":
    print("=== Тестирование API Instagram Downloader ===")
    print("\n1. Проверка health endpoint:")
    test_health()
    
    print("\n2. Тестирование download endpoint:")
    test_api() 