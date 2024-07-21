

export interface Fonts {
    primaryFont: string, 
    secondaryFont: string
}

export interface Colors {
    colors: {
        primaryColor: string,
        secondaryColors: Array<any>
    },
    backgroundColors: {        
        primaryColor: string,
        secondaryColors: Array<any>
    }
}

export interface EmailSave {
    save: string,
    updated_at: string
}