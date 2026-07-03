interface YeuCau {
    url: string;
    PhuongThuc: number;
    token?: string;
    fileArray?: File[];
}
export async function CallAPI(dulieu: FormData | null = null, yeucau: YeuCau) {
    const URL = 'http://localhost:3001/api';
    const DuongDan = URL + yeucau.url;
    let options: RequestInit = {};
    if (yeucau.fileArray) {
        if (dulieu === null) {
            dulieu = new FormData();
        }
        yeucau.fileArray.forEach((file: File) => {
            dulieu!.append("files", file);
        });
    }
    if (yeucau.PhuongThuc === 1) {
        options = {
            method: "POST",
            credentials: "include",
            headers: {},
            body: dulieu
        };
    }
    if (yeucau.PhuongThuc === 2) {
        options = {
            method: "GET",
            credentials: "include" 
        };
    }
    if (yeucau.token) {
       if (
        yeucau.token.startsWith("token_admin=") ||
        yeucau.token.startsWith("token=")
        ) {
        options.headers = {
        ...(options.headers || {}),
        Cookie: yeucau.token,
    };
}
    }
    try {
        const response = await fetch(DuongDan, options);
        return await response.json();
    } catch (error) {
        return {
            status: true,
            message: error instanceof Error
                ? error.message
                : String(error),
        };
    }
}
