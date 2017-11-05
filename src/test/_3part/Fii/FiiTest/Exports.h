#pragma once


#ifdef CLIENT
#define DLL_API extern "C" __declspec(dllimport) 
#else
#define DLL_API  extern "C" __declspec(dllexport) 
#endif // CLIENT

typedef void (*CB)(unsigned char * mem,int);

DLL_API void callback_1(CB x);
DLL_API void A();